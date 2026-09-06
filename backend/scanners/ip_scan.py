import socket
import requests


def scan_ip(domain):

    try:
        ip = socket.gethostbyname(domain)

        response = requests.get(
            f"http://ip-api.com/json/{ip}",
            timeout=10
        )

        data = response.json()

        return {
            "ip_address": ip,
            "country": data.get("country"),
            "region": data.get("regionName"),
            "city": data.get("city"),
            "isp": data.get("isp"),
            "org": data.get("org"),
            "asn": data.get("as"),
            "risk_score": 0,
            "risks": []
        }

    except Exception as e:

        return {
            "error": str(e),
            "risk_score": 0,
            "risks": []
        }
