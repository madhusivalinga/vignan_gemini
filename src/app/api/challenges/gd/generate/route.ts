import { NextResponse } from 'next/server';
import { executeGeminiRequest } from '@/lib/aiMonitor';

export async function POST(req: Request) {
  try {
    const { topic, history, expectedSpeaker } = await req.json();

    const prompt = `
You are simulating a professional Group Discussion for a university placement assessment.
The topic is: "${topic}".
Participants:
- Moderator (Admin)
- Alex (Opinionated, analytical)
- Priya (Supportive, factual)
- John (Critical, challenging)
- User (The real human student)

Here is the transcript so far:
${JSON.stringify(history)}

Generate the next response for the participant: "${expectedSpeaker}".
Their response should be natural, spoken English (1-3 sentences).
If they are countering, make it professional. If supporting, add a new fact.
If it is the Moderator concluding, summarize the discussion professionally in 3 sentences.

Return strictly as JSON with this schema:
{
  "content": "string (the character's response)"
}
No markdown, just valid JSON.
`;

    const result = await executeGeminiRequest(prompt, {
      temperature: 0.6,
      challengeType: 'gd_generate',
    });

    if (!result.success) {
      const status = result.quotaExhausted ? 429 : 500;
      return NextResponse.json({ error: result.error, quotaExhausted: result.quotaExhausted }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Generate GD response error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
