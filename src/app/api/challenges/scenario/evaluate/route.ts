import { NextResponse } from 'next/server';
import { executeGeminiRequest } from '@/lib/aiMonitor';

export async function POST(req: Request) {
  try {
    const { scenario, transcript, userId } = await req.json();

    const prompt = `
You are an expert Executive Coach evaluating performance in high-stakes professional scenarios.
The scenario was: "${scenario.scenarioDescription}"
The goal was: "${scenario.goal}"

The student's transcribed response:
"${transcript}"

Evaluate their response based on:
1. Communication Clarity
2. Leadership presence (taking charge of the situation)
3. Confidence
4. Professionalism
5. Decision Making Quality

Also provide a "Model Answer" that represents the gold standard response for this exact scenario.

Return strictly as JSON with this schema:
{
  "overallScore": number (0-100),
  "metrics": {
    "communication": number (0-100),
    "leadership": number (0-100),
    "confidence": number (0-100),
    "professionalism": number (0-100),
    "decisionMaking": number (0-100)
  },
  "feedback": [
    "string (insightful positive feedback)",
    "string (insightful constructive criticism)"
  ],
  "modelAnswer": "string (how a seasoned executive would have handled this in 3-4 sentences)"
}
No markdown, just valid JSON.
`;

    const result = await executeGeminiRequest(prompt, {
      temperature: 0.1,
      userId,
      challengeType: 'scenario_evaluate',
    });

    if (!result.success) {
      const status = result.quotaExhausted ? 429 : 500;
      return NextResponse.json({ error: result.error, quotaExhausted: result.quotaExhausted }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Evaluate scenario error:", error);
    return NextResponse.json({ error: "Failed to evaluate scenario" }, { status: 500 });
  }
}
