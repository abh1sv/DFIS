import hashlib
import requests


def scan_gravatar(email):
    if not email:
        return {
            "found": False,
            "finding": None
        }

    email = email.strip().lower()

    email_hash = hashlib.md5(
        email.encode()
    ).hexdigest()

    url = f"https://www.gravatar.com/avatar/{email_hash}?d=404"

    try:
        response = requests.get(
            url,
            timeout=5
        )

        if response.status_code == 200:
            return {
                "found": True,
                "finding": "Gravatar profile discovered"
            }

    except Exception:
        pass

    return {
        "found": False,
        "finding": None
    }