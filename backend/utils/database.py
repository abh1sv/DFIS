import sqlite3

DB_NAME = "database/dfis.db"


def init_db():

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_type TEXT,
            target TEXT,
            risk_score INTEGER,
            severity TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

def save_scan(
    scan_type,
    target,
    risk_score,
    severity
):

    print("SAVE_SCAN CALLED")

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO scans (
            scan_type,
            target,
            risk_score,
            severity
        )
        VALUES (?, ?, ?, ?)
    """, (
        scan_type,
        target,
        risk_score,
        severity
    ))

    conn.commit()

    print("ROW INSERTED")

    conn.close()

def get_stats():

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM scans")
    total_scans = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM scans WHERE severity='LOW'"
    )
    low = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM scans WHERE severity='MEDIUM'"
    )
    medium = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM scans WHERE severity='HIGH'"
    )
    high = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM scans WHERE severity='CRITICAL'"
    )
    critical = cursor.fetchone()[0]

    conn.close()

    return {
        "total_scans": total_scans,
        "low": low,
        "medium": medium,
        "high": high,
        "critical": critical
    }

def get_recent_scans(limit=10):

    conn = sqlite3.connect(DB_NAME)

    cursor = conn.cursor()

    cursor.execute("""
        SELECT id,
               target,
               risk_score,
               severity,
               timestamp
        FROM scans
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()

    conn.close()

    scans = []

    for row in rows:
        scans.append({
            "id": row[0],
            "target": row[1],
            "risk_score": row[2],
            "severity": row[3],
            "timestamp": row[4]
        })

    return scans