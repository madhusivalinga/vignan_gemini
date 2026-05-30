import { NextResponse } from 'next/server';
import { executeGeminiRequest } from '@/lib/aiMonitor';

export async function POST(req: Request) {
  try {
    const { type, skill } = await req.json();

    let prompt = "";
    if (type === 'technical') {
      prompt = `
You are a technical interviewer. Generate ONE initial EASY technical question for the skill: "${skill}".
Return strictly as JSON with this schema:
{
  "question": {
    "id": "q1",
    "text": "string",
    "difficulty": "easy"
  }
}
No markdown, just valid JSON.
`;
    } else {
      prompt = `
You are an HR Manager. Generate ONE initial EASY behavioral question.
Return strictly as JSON with this schema:
{
  "question": {
    "id": "q1",
    "text": "string",
    "difficulty": "easy"
  }
}
No markdown, just valid JSON.
`;
    }

    const result = await executeGeminiRequest(prompt, {
      temperature: 0.6,
      challengeType: `interview_generate_${type}`,
    });

    if (!result.success) {
      const status = result.quotaExhausted ? 429 : 500;
      return NextResponse.json({ error: result.error, quotaExhausted: result.quotaExhausted }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Generate interview questions error:", error);
    return NextResponse.json({ error: "Failed to generate AI questions" }, { status: 500 });
  }
}
