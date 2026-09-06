import logging
import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

from scanners.whois_scan import scan_whois
from scanners.gravatar_scan import scan_gravatar
from scanners.domain_scan import get_domain_info
from scanners.email_scan import scan_email
from scanners.username_scan import scan_username
from scanners.ip_scan import scan_ip

from utils.risk_engine import calculate_risk
from utils.database import (
    init_db,
    save_scan,
    get_stats,
    get_recent_scans
)

app = Flask(__name__)
CORS(app)

init_db()

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    filename="logs/scans.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

@app.route("/")
def home():
    return "DFIS Backend Running"

@app.route("/scan/username", methods=["POST"])
def username_scan_route():

    data = request.json

    username = data.get("username")

    logging.info(f"Username scan: {username}")

    result = scan_username(username)

    return jsonify(result)

@app.route("/scan/email", methods=["POST"])
def email_scan():

    data = request.json

    email = data.get("email")

    logging.info(f"Email scan: {email}")

    result = scan_email(email)

    return jsonify(result)

@app.route("/scan/domain", methods=["POST"])
def scan_domain():

    data = request.json
    domain = data.get("domain")

    logging.info(f"Domain scan: {domain}")

    result = get_domain_info(domain)

    return jsonify(result)

@app.route("/scan/full", methods=["POST"])
def full_scan():

    data = request.json

    email = data.get("email", "").strip()
    username = data.get("username", "").strip()

    if not email and not username:
        return jsonify({
            "error": "Provide email or username"
        }), 400

    domain = ""

    if email and "@" in email:
        domain = email.split("@")[1]
    
    whois_result = {
    "risk_score": 0,
    "risks": []
}

    ip_result = {
        "risk_score": 0,
        "risks": []
    }

    if domain:
        domain_result = get_domain_info(domain)
        whois_result = scan_whois(domain)
        ip_result = scan_ip(domain)
    else:
        domain_result = {
            "risk_score": 0,
            "risks": []
        }

    if email:
        email_result = scan_email(email)
    else:
        email_result = {
            "risk_score": 0,
            "risks": []
        }

    if username:
        username_result = scan_username(username)
    else:
        username_result = {
            "risk_score": 0,
            "risks": [],
            "found_on": []
        }

    if email:
        gravatar_result = scan_gravatar(email)
    else:
        gravatar_result = {
            "found": False,
            "finding": None
        }

    risk_result = calculate_risk(
        domain_result,
        email_result,
        username_result,
        whois_result
    )

    if gravatar_result["found"]:
        risk_result["findings"].append(
            gravatar_result["finding"]
        )

        risk_result["overall_score"] += 5

    print(risk_result)

    if email and username:
        target = f"{email} | {username}"
    elif email:
        target = email
    else:
        target = username

    save_scan(
        "FULL_SCAN",
        target,
        risk_result["overall_score"],
        risk_result["severity"]
    )

    return jsonify({
        "domain_scan": domain_result,
        "whois_scan": whois_result,
        "email_scan": email_result,
        "username_scan": username_result,
        "gravatar_scan": gravatar_result,
        "ip_scan": ip_result,
        "risk_assessment": risk_result
    })

@app.route("/stats")
def stats():

    return get_stats()

@app.route("/test")
def test():
    return get_domain_info("google.com")

@app.route("/test_email")
def test_email():

    return scan_email(
        "xejesol458@airhemp.com"
    )

@app.route("/test_username")
def test_username():

    return scan_username("torvalds")

@app.route("/test_full")
def test_full():

    email = "test@mailinator.com"
    username = "torvalds"

    domain = email.split("@")[1]

    domain_result = get_domain_info(domain)
    email_result = scan_email(email)
    username_result = scan_username(username)

    risk_result = calculate_risk(
        domain_result,
        email_result,
        username_result
    )

    gravatar_result = scan_gravatar(email)

    if gravatar_result["found"]:
        risk_result["findings"].append(
            gravatar_result["finding"]
        )

        risk_result["overall_score"] += 5

    print(risk_result)

    save_scan(
        "FULL_SCAN",
        email,
        risk_result["overall_score"],
        risk_result["severity"]
    )

    return {
        "domain_scan": domain_result,
        "email_scan": email_result,
        "username_scan": username_result,
        "risk_assessment": risk_result
    }

@app.route("/view_scans")
def view_scans():

    conn = sqlite3.connect("database/dfis.db")

    cursor = conn.cursor()

    cursor.execute("SELECT * FROM scans")

    rows = cursor.fetchall()

    conn.close()

    return {"scans": rows}

@app.route("/recent_scans")
def recent_scans():

    return {
        "scans": get_recent_scans()
    }

@app.route("/scan/<int:scan_id>")
def get_scan(scan_id):

    conn = sqlite3.connect("database/dfis.db")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM scans WHERE id = ?",
        (scan_id,)
    )

    row = cursor.fetchone()

    conn.close()

    if not row:
        return {"error": "Scan not found"}, 404

    return dict(row)

@app.route("/test_whois")
def test_whois():

    return scan_whois("google.com")

if __name__ == "__main__":
    app.run(debug=True)