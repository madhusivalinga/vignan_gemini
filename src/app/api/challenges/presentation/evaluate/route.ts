import { NextResponse } from 'next/server';
import { executeGeminiRequest } from '@/lib/aiMonitor';

export async function POST(req: Request) {
  try {
    const { topic, transcript, userId } = await req.json();

    const prompt = `
You are an expert AI Presentation Evaluator.
The user delivered a presentation on the topic: "${topic}"
Here is the transcript of their presentation:
"${transcript}"

First, conduct a Content Accuracy Analysis:
- Check if the content is correct, related to the topic, and accurate.
- If they made factual mistakes, identify the mistakes and provide the correct fact.
- Do NOT just evaluate grammar.

Then evaluate communication skills based on the flow and structure of the speech.
Provide a "Professional Model Answer" which shows how an expert would have spoken on this topic.

Return strictly as JSON with this schema:
{
  "overallScore": number (0-100),
  "inaccuracies": [
    {
      "mistake": "string (what they said wrong)",
      "correction": "string (the actual fact)"
    }
  ],
  "metrics": {
    "confidence": number (0-100),
    "professionalism": number (0-100),
    "engagement": number (0-100),
    "flow": number (0-100)
  },
  "feedback": [
    "string (actionable advice 1)",
    "string (actionable advice 2)"
  ],
  "modelAnswer": "string (a very professional 2-3 sentence version of what they should have said)"
}
No markdown, just valid JSON.
`;

    const result = await executeGeminiRequest(prompt, {
      temperature: 0.1,
      userId,
      challengeType: 'presentation',
    });

    if (!result.success) {
      const status = result.quotaExhausted ? 429 : 500;
      return NextResponse.json({ error: result.error, quotaExhausted: result.quotaExhausted }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Evaluate presentation error:", error);
    return NextResponse.json({ error: "Failed to evaluate presentation" }, { status: 500 });
  }
}
