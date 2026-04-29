import express from "express";
import { createWebhookHandler } from "./webhook.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

if (!SLACK_WEBHOOK_URL) {
  console.error("SLACK_WEBHOOK_URL environment variable is required");
  process.exit(1);
}

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const handleWebhook = createWebhookHandler(SLACK_WEBHOOK_URL);

app.post("/webhook/bolna", handleWebhook);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Bolna-Slack integration server running on port ${PORT}`);
  console.log(`Webhook endpoint: POST /webhook/bolna`);
  console.log(`Health check: GET /health`);
});
