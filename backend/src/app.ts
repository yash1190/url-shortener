import express from "express";
import cors from "cors";
import urlRoutes from "./routes/urlRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("URL Shortener API Running");
});

app.use(urlRoutes);

export default app;