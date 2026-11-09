import { NextRequest, NextResponse } from "next/server";

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

interface SerperResponse {
  organic?: SerperResult[];
}

export async function POST(req: NextRequest) {
  try {
    const { query, region = "Global" } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "A valid query string is required" },
        { status: 400 }
      );
    }

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json(
        {
          error:
            "N8N_WEBHOOK_URL is not configured. Add it to .env.local to use the n8n workflow.",
        },
        { status: 500 }
      );
    }

    // Forward the request to the n8n webhook
    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, region }),
    });

    if (!n8nRes.ok) {
      console.error("n8n Webhook error:", n8nRes.status, n8nRes.statusText);
      try {
          const errText = await n8nRes.text();
          console.error("n8n response body:", errText);
      } catch (e) {
          // Ignore text parsing errors
      }
      return NextResponse.json(
        { error: "The n8n workflow returned an error. Check n8n execution logs." },
        { status: 502 }
      );
    }

    const data = await n8nRes.json();
    
    return NextResponse.json(data);
  } catch (err) {
    console.error("Research API error:", err);
    return NextResponse.json(
      { error: "Could not reach the research workflow. Please try again in a moment." }, // the details (including the webhook URL) are in the server log above
      { status: 500 }
    );
  }
}
