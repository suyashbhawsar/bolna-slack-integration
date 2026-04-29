import { sendSlackAlert } from "./slack.js";

function extractCallData(payload) {
  const id = payload.id;
  const agent_id = payload.agent_id;
  const duration = payload.telephony_data?.duration ?? payload.conversation_time ?? 0;
  const transcript = payload.transcript || "";

  return { id, agent_id, duration, transcript };
}

function isCompletedCall(payload) {
  return payload.status === "completed";
}

export async function handleBolnaWebhookPayload(payload, slackWebhookUrl) {
  try {
    if (!payload || !payload.id) {
      return { status: 400, json: { error: "Invalid payload" } };
    }

    if (!isCompletedCall(payload)) {
      console.log(`Call ${payload.id} status is "${payload.status}" - skipping`);
      return { status: 200, json: { status: "skipped" } };
    }

    console.log(`Processing completed call ${payload.id}`);

    const callData = extractCallData(payload);

    await sendSlackAlert(slackWebhookUrl, callData);

    return { status: 200, json: { status: "alert_sent" } };
  } catch (err) {
    console.error("Webhook handler error:", err);
    return { status: 500, json: { error: "Internal server error" } };
  }
}

export function createWebhookHandler(slackWebhookUrl) {
  return async (req, res) => {
    const result = await handleBolnaWebhookPayload(req.body, slackWebhookUrl);
    res.status(result.status).json(result.json);
  };
}
