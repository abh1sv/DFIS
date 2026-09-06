import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function History() {
  const [scans, setScans] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/recent_scans"
      );

      setScans(response.data.scans);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <nav className="bg-slate-900 border-b border-slate-700 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400">
          DFIS
        </h1>

        <div className="flex gap-6">
          <Link
            to="/"
            className="text-slate-300 hover:text-cyan-400"
          >
            Dashboard
          </Link>

          <Link
            to="/history"
            className="text-cyan-400"
          >
            History
          </Link>
        </div>
      </nav>

      <div className="p-8">
      <h1 className="text-4xl font-bold text-cyan-400 mb-6">
        Investigation History
      </h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search target..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 w-full"
        />
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-700">
            <tr>
              <th className="py-3">ID</th>
              <th className="py-3">Target</th>
              <th className="py-3">Risk Score</th>
              <th className="py-3">Severity</th>
              <th className="py-3">Timestamp</th>
            </tr>
          </thead>

          <tbody>
          {scans
            .filter((scan) =>
              (scan.target || "")
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((scan) => (
              <tr
                key={scan.id}
                className="border-b border-slate-800 cursor-pointer hover:bg-slate-800"
                onClick={() => {
                  window.location.href = `/scan/${scan.id}`;
                }}
              >
                <td className="py-3">{scan.id}</td>
                <td>{scan.target || "N/A"}</td>
                <td>{scan.risk_score}</td>
                
                <td>
                  <span
                    className={`px-3 py-1 rounded-md text-white ${
                      scan.severity === "LOW"
                        ? "bg-green-600"
                        : scan.severity === "MEDIUM"
                        ? "bg-yellow-500"
                        : scan.severity === "HIGH"
                        ? "bg-orange-500"
                        : "bg-red-600"
                    }`}
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
  </div>
);
}

export default History;