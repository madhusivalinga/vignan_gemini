import { NextResponse } from 'next/server';
import { executeGeminiRequest } from '@/lib/aiMonitor';

const SCENARIOS = [
  "Startup Pitch: Pitch a revolutionary AI education app to potential investors.",
  "Placement Interview: Explain why you are uniquely qualified for the software engineering role at a major tech firm.",
  "Seminar Presentation: Deliver an opening statement for a seminar on the ethical implications of Artificial Intelligence.",
  "Client Meeting: De-escalate a situation with a major client who is upset about a missed deadline.",
  "Team Leadership Discussion: Unify a divided development team that is arguing over which tech stack to use for a critical project."
];

export async function GET() {
  try {
    const selectedScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

    const prompt = `
You are an expert Scenario Generator.
Expand on the following scenario premise to create a highly detailed, professional challenge (3-4 sentences maximum).
The challenge should require the user to speak for about 1-2 minutes.
Premise: "${selectedScenario}"

Return strictly as JSON with this schema:
{
  "title": "string (A punchy, professional title)",
  "scenarioDescription": "string (The detailed 3-4 sentence scenario context)",
  "goal": "string (A clear instruction on what the user must achieve in their speech)"
}
No markdown, just valid JSON.
`;

    const result = await executeGeminiRequest(prompt, {
      temperature: 0.7,
      challengeType: 'scenario_generate',
    });

    if (!result.success) {
      const status = result.quotaExhausted ? 429 : 500;
      return NextResponse.json({ error: result.error, quotaExhausted: result.quotaExhausted }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Generate scenario error:", error);
    return NextResponse.json({ error: "Failed to generate scenario" }, { status: 500 });
  }
}
