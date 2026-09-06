import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function ScanDetails() {

  const { id } = useParams();

  const [scan, setScan] = useState(null);

  useEffect(() => {
    loadScan();
  }, []);

  const loadScan = async () => {

    try {

      const response = await axios.get(
        `http://127.0.0.1:5000/scan/${id}`
      );

      setScan(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  if (!scan) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <Link
        to="/history"
        className="text-cyan-400"
      >
        ← Back to History
      </Link>

      <h1 className="text-4xl font-bold text-cyan-400 mt-4 mb-6">
        Scan #{scan.id}
      </h1>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">

        <p>
          <strong>Target:</strong> {scan.target}
        </p>

        <p>
          <strong>Risk Score:</strong> {scan.risk_score}
        </p>

        <p>
          <strong>Severity:</strong> {scan.severity}
        </p>

        <p>
          <strong>Timestamp:</strong> {scan.timestamp}
        </p>

      </div>

    </div>
  );
}

export default ScanDetails;