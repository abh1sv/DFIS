import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [scanResult, setScanResult] = useState(null);

  const loadStats = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/stats"
      );

      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadRecentScans = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/recent_scans"
      );

      setRecentScans(response.data.scans);
    } catch (error) {
      console.error(error);
    }
  };

  const runInvestigation = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:5000/scan/full",
        {
          email,
          username,
        }
      );

      setScanResult(response.data);

      await loadStats();
      await loadRecentScans();

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadRecentScans();
  }, []);

  if (!stats) {
    return <h1>Loading...</h1>;
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "LOW":
        return "green";
      case "MEDIUM":
        return "gold";
      case "HIGH":
        return "orange";
      case "CRITICAL":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-cyan-400">
          DFIS
        </h1>

        <p className="text-slate-400">
          Digital Footprint Intelligence Scanner
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg">
          <h3 className="text-slate-400 text-sm">
            Total Scans
          </h3>

          <h2 className="text-3xl font-bold text-cyan-400 mt-2">
            {stats.total_scans}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg">
          <h3 className="text-slate-400 text-sm">
            Low
          </h3>

          <h2 className="text-3xl font-bold text-green-400 mt-2">
            {stats.low}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg">
          <h3 className="text-slate-400 text-sm">
            Medium
          </h3>

          <h2 className="text-3xl font-bold text-yellow-400 mt-2">
            {stats.medium}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg">
          <h3 className="text-slate-400 text-sm">
            High
          </h3>

          <h2 className="text-3xl font-bold text-orange-400 mt-2">
            {stats.high}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg">
          <h3 className="text-slate-400 text-sm">
            Critical
          </h3>

          <h2 className="text-3xl font-bold text-red-400 mt-2">
            {stats.critical}
          </h2>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          Run Investigation
        </h2>

        <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Email"
          className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 flex-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          
        />

        <input
          type="text"
          placeholder="Username"
          className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 flex-1"
          value={username}
          onChange={(e) => setUsername(e.target.value)}

        />

        <button
          onClick={runInvestigation}
          disabled={loading}
          className={`px-5 py-2 rounded-lg font-semibold ${
            loading
              ? "bg-slate-600 cursor-not-allowed"
              : "bg-cyan-600 hover:bg-cyan-700"
          }`}
        >
          {loading ? "Running Investigation..." : "Run Investigation"}
        </button>
      </div>
      </div>

      {scanResult && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
        
          <h3 className="text-2xl font-semibold mb-4">
            Investigation Result
          </h3>

          <p className="text-lg mt-2">
            <strong>Overall Score:</strong>{" "}
            <span className="text-cyan-400 font-bold">
              {scanResult.risk_assessment.overall_score}
            </span>
          </p>

          <p>
            <strong>Severity:</strong>{" "}
            <span
              style={{
                backgroundColor: getSeverityColor(
                  scanResult.risk_assessment.severity
                ),
                color: "white",
                padding: "4px 10px",
                borderRadius: "6px",
              }}
            >
              {scanResult.risk_assessment.severity}
            </span>
          </p>

          <h4>Findings</h4>

          <ul className="list-disc ml-6 mt-2 space-y-1">
            {scanResult.risk_assessment.findings.map(
              (finding, index) => (
                <li key={index}>{finding}</li>
              )
            )}
          </ul>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">
        Recent Investigations
      </h2>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 overflow-x-auto">

      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Target</th>
            <th>Risk Score</th>
            <th>Severity</th>
            <th>Timestamp</th>
          </tr>
        </thead>

        <tbody>
          {recentScans.map((scan) => (
            <tr key={scan.id}>
              <td>{scan.id}</td>
              <td>{scan.target}</td>
              <td>{scan.risk_score}</td>
              <td>
                <span
                  style={{
                    backgroundColor: getSeverityColor(
                      scan.severity
                    ),
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: "6px",
                  }}
                >
                  {scan.severity}
                </span>
              </td>
              <td>{scan.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}


export default App;