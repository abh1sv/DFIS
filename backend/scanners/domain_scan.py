import whois
import dns.resolver
import requests


def get_domain_info(domain):
    result = {
        "domain": domain,
        "risk_score": 0,
        "risks": []
    }

    # A Records (IPv4)
    try:
        a_records = dns.resolver.resolve(domain, "A")

        result["ip_addresses"] = [
            str(record)
            for record in a_records
        ]

    except Exception:
        result["ip_addresses"] = []

    # WHOIS
    try:
        w = whois.whois(domain)

        result["registrar"] = str(w.registrar)
        result["creation_date"] = str(w.creation_date)
        result["expiration_date"] = str(w.expiration_date)

    except Exception as e:
        result["whois_error"] = str(e)

    # MX Records
    try:
        mx_records = dns.resolver.resolve(domain, "MX")

        result["mx_records"] = [
            str(mx.exchange)
            for mx in mx_records
        ]

    except Exception:
        result["mx_records"] = []

        result["risk_score"] += 20
        result["risks"].append("No MX records found")

    # Name Servers
    try:
        ns_records = dns.resolver.resolve(domain, "NS")

        result["name_servers"] = [
            str(ns.target)
            for ns in ns_records
        ]

    except Exception:
        result["name_servers"] = []

    # SPF
    try:
        txt_records = dns.resolver.resolve(domain, "TXT")

        spf_found = False

        for record in txt_records:
            txt = str(record)

            if "v=spf1" in txt:
                spf_found = True
                result["spf"] = txt
                break

        if not spf_found:
            result["spf"] = "Not Found"
            result["risk_score"] += 15
            result["risks"].append("SPF missing")

    except Exception:
        result["spf"] = "Error"
        result["risk_score"] += 15
        result["risks"].append("Unable to verify SPF")

    # DMARC
    try:
        dmarc_domain = f"_dmarc.{domain}"

        dmarc_records = dns.resolver.resolve(
            dmarc_domain,
            "TXT"
        )

        result["dmarc"] = str(
            dmarc_records[0]
        )

    except Exception:
        result["dmarc"] = "Not Found"

        result["risk_score"] += 15
        result["risks"].append("DMARC missing")

    # Security Headers
    try:

        response = requests.get(
            f"https://{domain}",
            timeout=5,
            allow_redirects=True
        )

        headers = response.headers

        security_headers = {
            "HSTS": "Strict-Transport-Security" in headers,
            "CSP": (
                "Content-Security-Policy" in headers
                or "Content-Security-Policy-Report-Only" in headers
            ),
            "X-Frame-Options": "X-Frame-Options" in headers,
            "X-Content-Type-Options":
                "X-Content-Type-Options" in headers
        }

        result["security_headers"] = security_headers

        missing = [
            key
            for key, value in security_headers.items()
            if not value
        ]

        if missing:
            for header in missing:
                result["risks"].append(
                    f"Missing security header: {header}"
                )

            result["risk_score"] += len(missing) * 2

    except Exception as e:

        result["security_headers_error"] = str(e)

    if result["risk_score"] <= 10:
        result["severity"] = "LOW"

    elif result["risk_score"] <= 30:
        result["severity"] = "MEDIUM"

    elif result["risk_score"] <= 60:
        result["severity"] = "HIGH"

    else:
        result["severity"] = "CRITICAL"

    return result