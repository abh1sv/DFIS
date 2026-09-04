def calculate_risk(domain_result, email_result, username_result):

    total_score = (
        domain_result.get("risk_score", 0)
        + email_result.get("risk_score", 0)
        + username_result.get("risk_score", 0)
    )

    if total_score <= 20:
        severity = "LOW"

    elif total_score <= 50:
        severity = "MEDIUM"

    elif total_score <= 80:
        severity = "HIGH"

    else:
        severity = "CRITICAL"

    findings = []

    findings.extend(domain_result.get("risks", []))
    findings.extend(email_result.get("risks", []))
    findings.extend(username_result.get("risks", []))

    for platform in username_result.get("found_on", []):
        findings.append(
            f"{platform} profile found"
        )

    return {
        "overall_score": total_score,
        "severity": severity,
        "findings": findings
    }