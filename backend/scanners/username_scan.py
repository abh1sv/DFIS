import requests

PLATFORMS = {
    "GitHub": "https://github.com/{}",
    "Reddit": "https://www.reddit.com/user/{}",
    "GitLab": "https://gitlab.com/{}",
    "HackerOne": "https://hackerone.com/{}"
}


def scan_username(username):

    result = {
        "username": username,
        "found_on": [],
        "risk_score": 0,
        "risks": []
    }

    headers = {
        "User-Agent": "DFIS Scanner"
    }

    for platform, url_template in PLATFORMS.items():

        url = url_template.format(username)

        try:
            response = requests.get(
                url,
                headers=headers,
                timeout=5
            )

            if response.status_code == 200:
                result["found_on"].append(platform)

        except Exception:
            pass

    exposure_count = len(result["found_on"])

    result["risk_score"] = min(exposure_count * 5, 25)

    if exposure_count >= 3:
        result["risks"].append(
            "Username exposed across multiple platforms"
        )

    return result