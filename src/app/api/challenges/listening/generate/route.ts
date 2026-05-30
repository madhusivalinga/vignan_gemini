import { NextResponse } from 'next/server';
import { executeGeminiRequest } from '@/lib/aiMonitor';

export async function GET() {
  try {
    const prompt = `
You are an AI Communication Coach creating a listening comprehension test.
Generate a short professional story or workplace scenario (150-200 words).
Then generate 3 multiple-choice comprehension questions based on the story.

Return strictly as JSON with this schema:
{
  "storyTitle": "string",
  "storyText": "string",
  "questions": [
    { 
      "id": "q1", 
      "text": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string"
    }
  ]
}
Each question must have exactly 4 options. The correctAnswer must match one of the options exactly.
No markdown, just valid JSON.
`;

    const result = await executeGeminiRequest(prompt, {
      temperature: 0.7,
      challengeType: 'listening_generate',
    });

    if (!result.success) {
      const status = result.quotaExhausted ? 429 : 500;
      return NextResponse.json({ error: result.error, quotaExhausted: result.quotaExhausted }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Generate listening task error:", error);
    return NextResponse.json({ error: "Failed to generate task" }, { status: 500 });
  }
}
