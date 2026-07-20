import express from "express";
import cors from "cors";
import urlRoutes from "./routes/urlRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
}));
app.use(express.json());

app.get("/", (_, res) => {
  res.send("URL Shortener API Running");
});

app.use(authRoutes);
app.use(urlRoutes);

export default app;