import { handleBolnaWebhookPayload } from "./webhook.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ status: "ok" });
    }

    if (request.method === "POST" && url.pathname === "/webhook/bolna") {
      const slackUrl = env.SLACK_WEBHOOK_URL;
      if (!slackUrl || typeof slackUrl !== "string") {
        return Response.json(
          { error: "SLACK_WEBHOOK_URL is not configured on the Worker" },
          { status: 500 },
        );
      }

      let payload;
      try {
        payload = await request.json();
      } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
      }

      const result = await handleBolnaWebhookPayload(payload, slackUrl);
      return Response.json(result.json, { status: result.status });
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
};
