import { NextResponse } from 'next/server';
import { executeGeminiRequest } from '@/lib/aiMonitor';

export async function POST(req: Request) {
  try {
    const { skill, history, type } = await req.json();

    let roleDescription = `technical interviewer for "${skill}"`;
    let focusPoints = `technical depth and conceptual clarity`;
    
    if (type === 'hr') {
       roleDescription = `HR/Behavioral Interviewer`;
       focusPoints = `emotional intelligence, leadership potential, and communication style`;
    }

    const prompt = `
You are an expert ${roleDescription}.
You have just received the user's answers to previous questions:
${JSON.stringify(history)}

Based on their performance so far, focusing on ${focusPoints}, generate the NEXT question.
- If they performed well, increase the difficulty or depth.
- If they struggled, keep it accessible but try a different angle.

Return strictly as JSON with this schema:
{
  "question": {
    "id": "qNext",
    "text": "string",
    "difficulty": "easy | moderate | challenging"
  }
}
No markdown, just valid JSON.
`;

    const result = await executeGeminiRequest(prompt, {
      temperature: 0.7,
      challengeType: 'interview_adaptive_next',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Adaptive question error:", error);
    return NextResponse.json({ error: "Failed to generate adaptive question" }, { status: 500 });
  }
}
