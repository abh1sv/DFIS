import re
import dns.resolver
import os

def load_disposable_domains():

    path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "data",
        "disposable_domains.txt"
    )

    try:

        with open(path, "r") as file:

            return {
                line.strip().lower()
                for line in file
                if line.strip()
            }

    except Exception:

        return set()


DISPOSABLE_DOMAINS = load_disposable_domains()


def scan_email(email):

    result = {
        "email": email,
        "valid": False,
        "email_type": "Unknown",
        "risk_score": 0,
        "risks": []
    }

    # Format validation
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    if not re.match(pattern, email):
        result["risks"].append(
            "Invalid email format"
        )
        result["risk_score"] += 50

        return result

    result["valid"] = True

    domain = email.split("@")[1]

    # Disposable check
    if domain.lower() in DISPOSABLE_DOMAINS:

        result["email_type"] = "Disposable"

        result["risk_score"] += 40

        result["risks"].append(
            "Disposable email detected"
        )

    else:

        result["email_type"] = "Standard"

    # MX lookup
    try:

        mx_records = dns.resolver.resolve(
            domain,
            "MX"
        )

        result["mx_records"] = [
            str(mx.exchange)
            for mx in mx_records
        ]

    except Exception:

        result["mx_records"] = []

        result["risk_score"] += 20

        result["risks"].append(
            "No MX records found"
        )

    return result