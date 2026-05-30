import { NextResponse } from 'next/server';
import { executeGeminiRequest } from '@/lib/aiMonitor';

export async function POST(req: Request) {
  try {
    const { storyText, questions, userAnswers, userId } = await req.json();

    const prompt = `
You are an expert AI evaluator for listening comprehension.
A user listened to the story: "${storyText}"

They answered these multiple-choice questions:
${JSON.stringify(questions)}

User selections:
${JSON.stringify(userAnswers)}

Grade each selection against the correctAnswer provided in the questions array.
Return strictly as JSON with this schema:
{
  "overallScore": number (0-100),
  "results": [
    {
      "questionId": "string",
      "userAnswer": "string",
      "correctAnswer": "string",
      "isCorrect": boolean,
      "explanation": "string"
    }
  ],
  "feedback": "string (overall feedback)"
}
No markdown, just valid JSON.
`;

    const result = await executeGeminiRequest(prompt, {
      temperature: 0.1,
      userId,
      challengeType: 'listening_evaluate',
    });

    if (!result.success) {
      const status = result.quotaExhausted ? 429 : 500;
      return NextResponse.json({ error: result.error, quotaExhausted: result.quotaExhausted }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Evaluate listening task error:", error);
    return NextResponse.json({ error: "Failed to evaluate answers" }, { status: 500 });
  }
}
