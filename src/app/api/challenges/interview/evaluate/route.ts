import { NextResponse } from 'next/server';
import { executeGeminiRequest } from '@/lib/aiMonitor';

export async function POST(req: Request) {
  try {
    const { type, qna } = await req.json();

    let prompt = "";
    if (type === 'technical') {
      prompt = `
You are an expert Technical Interviewer.
Here are the questions asked and the candidate's transcribed answers:
${JSON.stringify(qna)}

For each question, evaluate if the answer is factually correct.
Return strictly as JSON with this schema:
{
  "overallScore": number (0-100),
  "results": [
    {
       "questionId": "string",
       "isCorrect": boolean,
       "feedback": "string (why it is correct/incorrect)",
       "modelAnswer": "string (professional model response for technical correctness)"
    }
  ],
  "metrics": {
    "technicalAccuracy": number,
    "clarity": number
  },
  "feedback": ["array of 2 strings: overall feedback"]
}
No markdown, just valid JSON.
`;
    } else {
      prompt = `
You are an expert HR Interviewer.
Here are the behavioral questions asked and the candidate's transcribed answers:
${JSON.stringify(qna)}

Evaluate their communication, confidence, professionalism, leadership, and emotional intelligence based on their transcripts.
For each question, provide a corrected grammactical version, and a fully professional version.
Return strictly as JSON with this schema:
{
  "overallScore": number (0-100),
  "results": [
    {
       "questionId": "string",
       "originalSpeech": "string",
       "correctedSpeech": "string",
       "professionalSpeech": "string",
       "feedback": "string (evaluation of emotional intelligence and professionalism)"
    }
  ],
  "metrics": {
    "communication": number,
    "confidence": number,
    "professionalism": number,
    "leadership": number,
    "emotionalIntelligence": number
  },
  "feedback": ["array of 2 strings: overall feedback"]
}
No markdown, just valid JSON.
`;
    }

    const result = await executeGeminiRequest(prompt, {
      temperature: 0.1,
      challengeType: `interview_evaluate_${type}`,
    });

    if (!result.success) {
      const status = result.quotaExhausted ? 429 : 500;
      return NextResponse.json({ error: result.error, quotaExhausted: result.quotaExhausted }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Evaluate interview error:", error);
    return NextResponse.json({ error: "Failed to evaluate interview" }, { status: 500 });
  }
}
