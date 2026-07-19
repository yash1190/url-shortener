import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/authContext";

interface UrlItem {
  shortCode: string;
  longUrl: string;
  createdAt: string;
  isActive: boolean;
}

const DashboardPage = () => {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [longUrl, setLongUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  const fetchUrls = async () => {
    const res = await client.get("/api/urls/mine");
    setUrls(res.data);
  };

  useEffect(() => {
    fetchUrls().catch(() => setError("Failed to load your links"));
  }, []);

  const handleCreate = async () => {
    setError(null);
    try {
      await client.post("/api/urls", { longUrl });
      setLongUrl("");
      await fetchUrls(); // refresh the list
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to create link");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>My Links</h1>
        <button onClick={logout} style={{ height: 36 }}>Log out</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          placeholder="Paste a long URL to shorten…"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={handleCreate}>Shorten</button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {urls.length === 0 && <p>No links yet — create your first one above.</p>}

      {urls.map((u) => (
        <div
          key={u.shortCode}
          style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}
        >
          <a href={`http://localhost:5000/${u.shortCode}`} target="_blank">
            localhost:5000/{u.shortCode}
          </a>
          <div style={{ color: "#666", fontSize: 14 }}>{u.longUrl}</div>
          <Link to={`/stats/${u.shortCode}`}>View stats →</Link>
        </div>
      ))}
    </div>
  );
};

export default DashboardPage;