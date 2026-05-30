import { NextResponse } from 'next/server';
import { executeGeminiRequest } from '@/lib/aiMonitor';

export async function POST(req: Request) {
  try {
    const { transcript, topic, userId } = await req.json();

    const prompt = `
You are an expert AI Career Coach evaluating a Group Discussion.
Topic: "${topic}"
Here is the transcript of the group discussion:
${JSON.stringify(transcript)}

Focus strictly on the "user" participant's responses.
Evaluate their performance in the group discussion based on:
1. Leadership
2. Confidence (as inferred from language and flow)
3. Logical Thinking
4. Communication Skills
5. Argument Quality

Return strictly as JSON with this schema:
{
  "overallScore": number (0-100),
  "metrics": {
    "leadership": number (0-100),
    "confidence": number (0-100),
    "logicalThinking": number (0-100),
    "communication": number (0-100),
    "argumentQuality": number (0-100)
  },
  "feedback": [
    "string (specific actionable positive feedback)",
    "string (specific actionable criticism)",
    "string (advice for future group discussions)"
  ],
  "bestArgument": "string (quote their best point, or state 'none' if they didn't speak well)"
}
No markdown, just valid JSON.
`;

    const result = await executeGeminiRequest(prompt, {
      temperature: 0.1,
      userId,
      challengeType: 'gd_evaluate',
    });

    if (!result.success) {
      const status = result.quotaExhausted ? 429 : 500;
      return NextResponse.json({ error: result.error, quotaExhausted: result.quotaExhausted }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Evaluate GD error:", error);
    return NextResponse.json({ error: "Failed to evaluate Group Discussion" }, { status: 500 });
  }
}
