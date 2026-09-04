import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

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

  const exportPDF = () => {
    if (!scanResult) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("DFIS Investigation Report", 20, 20);

    doc.setFontSize(12);

    doc.text(
      `Risk Score: ${scanResult.risk_assessment.overall_score}`,
      20,
      40
    );

    doc.text(
      `Severity: ${scanResult.risk_assessment.severity}`,
      20,
      50
    );

    doc.text("Findings:", 20, 70);

    scanResult.risk_assessment.findings.forEach(
      (finding, index) => {
        doc.text(
          `• ${finding}`,
          25,
          85 + index * 10
        );
      }
    );

    doc.save("DFIS_Report.pdf");
  };

  const chartData = [
    { name: "Low", value: stats.low },
    { name: "Medium", value: stats.medium },
    { name: "High", value: stats.high },
    { name: "Critical", value: stats.critical },
  ];

  const COLORS = [
    "#22c55e",
    "#eab308",
    "#f97316",
    "#ef4444",
  ];

  const trendData = recentScans
    .slice(0, 10)
    .reverse()
    .map((scan) => ({
      id: scan.id,
      score: scan.risk_score,
    }));

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

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">
          Severity Distribution
        </h2>

        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={120}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend
                wrapperStyle={{
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">
          Investigation Trends
        </h2>

        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

              <XAxis
                dataKey="id"
                stroke="#94a3b8"
              />

              <YAxis stroke="#94a3b8" />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />

              <Bar
                dataKey="score"
                fill="#06b6d4"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
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

          <button
            onClick={exportPDF}
            className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
          >
            Export PDF Report
          </button>

        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">
        Recent Investigations
      </h2>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 overflow-x-auto">

      <table className="w-full text-left">
        <thead className="border-b border-slate-700 text-slate-400">
          <tr>
            <th className="py-3">ID</th>
            <th className="py-3">Target</th>
            <th className="py-3">Risk Score</th>
            <th className="py-3">Severity</th>
            <th className="py-3">Timestamp</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800">
          {recentScans.map((scan) => (
            <tr
              key={scan.id}
              className="hover:bg-slate-800 transition"
            >
              <td className="py-3">{scan.id}</td>
              <td className="py-3">{scan.target}</td>
              <td className="py-3">{scan.risk_score}</td>
              <td className="py-3">
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