import { NextResponse } from 'next/server';
import { executeGeminiRequest } from '@/lib/aiMonitor';

export async function POST(req: Request) {
  try {
    const { transcript, userId } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const prompt = `
You are an expert AI Communication Coach.
Evaluate the following introductory speech from a university student:
"${transcript}"

Provide your feedback strictly as a JSON object with the following schema:
{
  "originalText": "the exact transcript provided",
  "correctedText": "the transcript with grammatical errors corrected",
  "professionalText": "a highly professional, refined version of the speech suitable for an interview",
  "metrics": {
    "fluency": number (0-100),
    "grammar": number (0-100),
    "clarity": number (0-100),
    "vocabulary": number (0-100)
  },
  "overallScore": number (0-100, average of metrics),
  "feedback": [
    "string (specific, actionable piece of feedback 1)",
    "string (specific, actionable piece of feedback 2)",
    "string (specific, actionable piece of feedback 3)"
  ]
}

Ensure the response is ONLY valid JSON, with no markdown formatting or extra text.
`;

    const result = await executeGeminiRequest(prompt, {
      temperature: 0.2,
      userId,
      challengeType: 'introduction',
    });

    if (!result.success) {
      const status = result.quotaExhausted ? 429 : 500;
      return NextResponse.json({ error: result.error, quotaExhausted: result.quotaExhausted }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ error: "Failed to evaluate speech" }, { status: 500 });
  }
}
