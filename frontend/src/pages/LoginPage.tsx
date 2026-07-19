import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError(null);
    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Something went wrong");
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h1>URL Shortener</h1>
      <h3>{isRegistering ? "Create an account" : "Log in"}</h3>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", width: "100%", padding: 8, marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="Password (min 8 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", width: "100%", padding: 8, marginBottom: 10 }}
      />

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <button onClick={handleSubmit} style={{ padding: "8px 16px" }}>
        {isRegistering ? "Register" : "Log in"}
      </button>

      <p
        onClick={() => setIsRegistering(!isRegistering)}
        style={{ cursor: "pointer", color: "steelblue", marginTop: 12 }}
      >
        {isRegistering
          ? "Already have an account? Log in"
          : "New here? Create an account"}
      </p>
    </div>
  );
};

export default LoginPage;