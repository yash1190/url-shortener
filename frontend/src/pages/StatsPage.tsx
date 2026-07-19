import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import client from "../api/client";

interface DayCount {
  date: string;
  count: number;
}

interface ReferrerCount {
  referrer: string;
  count: number;
}

interface Stats {
  shortCode: string;
  longUrl: string;
  createdAt: string;
  totalClicks: number;
  clicksPerDay: DayCount[];
  topReferrers: ReferrerCount[];
}

const StatsPage = () => {
  const { shortCode } = useParams();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .get(`/api/urls/${shortCode}/stats`)
      .then((res) => setStats(res.data))
      .catch((err) =>
        setError(err.response?.data?.error ?? "Failed to load stats")
      );
  }, [shortCode]);

  if (error) {
    return (
      <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
        <p style={{ color: "crimson" }}>{error}</p>
        <Link to="/">← Back to my links</Link>
      </div>
    );
  }

  if (!stats) return <p style={{ textAlign: "center", marginTop: 80 }}>Loading…</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <Link to="/">← Back to my links</Link>
      <h1>Stats: {stats.shortCode}</h1>
      <p style={{ color: "#666" }}>{stats.longUrl}</p>

      <h2 style={{ fontSize: 42, margin: "16px 0" }}>
        {stats.totalClicks}
        <span style={{ fontSize: 16, color: "#666" }}> total clicks</span>
      </h2>

      <h3>Clicks — last 7 days</h3>
      {stats.clicksPerDay.length === 0 ? (
        <p style={{ color: "#666" }}>No clicks in the last 7 days.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={stats.clicksPerDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#4682b4" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}

      <h3 style={{ marginTop: 28 }}>Top referrers</h3>
      {stats.topReferrers.length === 0 ? (
        <p style={{ color: "#666" }}>No referrer data yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: 8 }}>Referrer</th>
              <th style={{ padding: 8 }}>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {stats.topReferrers.map((r) => (
              <tr key={r.referrer} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{r.referrer}</td>
                <td style={{ padding: 8 }}>{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StatsPage;