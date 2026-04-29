export async function sendSlackAlert(webhookUrl, callData) {
  const { id, agent_id, duration, transcript } = callData;

  const transcriptSnippet = transcript
    ? transcript.substring(0, 1500) + (transcript.length > 1500 ? "..." : "")
    : "No transcript available";

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Call Completed",
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Call ID*\n\`${id}\``,
        },
        {
          type: "mrkdwn",
          text: `*Agent ID*\n\`${agent_id}\``,
        },
        {
          type: "mrkdwn",
          text: `*Duration*\n${duration} seconds`,
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Transcript*\n${transcriptSnippet}`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Sent via Bolna Integration at ${new Date().toISOString()}`,
        },
      ],
    },
  ];

  const payload = {
    text: `Call Completed - ${id}`,
    blocks,
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Slack webhook responded with ${response.status}: ${errorText}`);
  }

  console.log(`Slack alert sent for call ${id}`);
}
