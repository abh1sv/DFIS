import whois
from datetime import datetime,timezone


def scan_whois(domain):

    result = {
        "domain": domain,
        "registrar": None,
        "creation_date": None,
        "expiration_date": None,
        "domain_age_days": 0,
        "risk_score": 0,
        "risks": []
    }

    try:
        w = whois.whois(domain)

        result["registrar"] = w.registrar

        creation_date = w.creation_date
        expiration_date = w.expiration_date

        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]

        result["creation_date"] = str(creation_date)
        result["expiration_date"] = str(expiration_date)

        if creation_date:
            age_days = (
                datetime.now(timezone.utc) - creation_date
            ).days

            result["domain_age_days"] = age_days

            if age_days < 180:
                result["risk_score"] += 10

                result["risks"].append(
                    "Recently registered domain"
                )

    except Exception:
        pass

    return result