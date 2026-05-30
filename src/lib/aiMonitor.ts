import { GoogleGenAI } from '@google/genai';

// ---------- Gemini Client ----------
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ---------- Types ----------
export interface GeminiResult {
  success: boolean;
  data: any;
  error?: string;
  quotaExhausted?: boolean;
}

// ---------- In-memory rate limiter (per-server instance) ----------
const recentRequests: Map<string, number[]> = new Map();

const COOLDOWN_MS = 1_000;  // 1 second between requests per user
const MAX_REQUESTS_PER_MINUTE = 15; // Increased for chat-heavy scenarios

function checkRateLimit(userId: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const userRequests = recentRequests.get(userId) || [];

  // Purge entries older than 60 seconds
  const recent = userRequests.filter(ts => now - ts < 60_000);

  if (recent.length >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, message: 'You have exceeded the maximum number of AI evaluations per minute. Please wait before submitting again.' };
  }

  if (recent.length > 0 && now - recent[recent.length - 1] < COOLDOWN_MS) {
    return { allowed: false, message: 'Please wait a few seconds before submitting another evaluation.' };
  }

  recent.push(now);
  recentRequests.set(userId, recent);
  return { allowed: true };
}

// ---------- In-memory stats (lightweight; no firebase-admin dependency) ----------
interface ApiStats {
  totalRequests: number;
  failedRequests: number;
  quotaExhaustedCount: number;
  dailyRequests: Map<string, number>;
  lastRequestAt: string | null;
}

const stats: ApiStats = {
  totalRequests: 0,
  failedRequests: 0,
  quotaExhaustedCount: 0,
  dailyRequests: new Map(),
  lastRequestAt: null,
};

function logApiCall(status: 'success' | 'failed' | 'quota_exhausted', challengeType: string) {
  const today = new Date().toISOString().split('T')[0];
  stats.totalRequests++;
  stats.lastRequestAt = new Date().toISOString();

  if (status === 'failed') stats.failedRequests++;
  if (status === 'quota_exhausted') stats.quotaExhaustedCount++;

  const dailyKey = `${today}_${challengeType}`;
  stats.dailyRequests.set(dailyKey, (stats.dailyRequests.get(dailyKey) || 0) + 1);
  stats.dailyRequests.set(today, (stats.dailyRequests.get(today) || 0) + 1);
}

/** Expose stats for the admin API endpoint */
export function getApiStats() {
  const today = new Date().toISOString().split('T')[0];
  return {
    totalRequests: stats.totalRequests,
    failedRequests: stats.failedRequests,
    quotaExhaustedCount: stats.quotaExhaustedCount,
    dailyRequests: stats.dailyRequests.get(today) || 0,
    lastRequestAt: stats.lastRequestAt,
  };
}

// ---------- Main Exported Function ----------
export async function executeGeminiRequest(
  prompt: string,
  options: {
    temperature?: number;
    userId?: string;
    challengeType: string;
  }
): Promise<GeminiResult> {
  const userId = options.userId || 'anonymous';

  // 1. Rate limit check
  const rateCheck = checkRateLimit(userId);
  if (!rateCheck.allowed) {
    return {
      success: false,
      data: null,
      error: rateCheck.message,
      quotaExhausted: false,
    };
  }

  // 2. Execute Gemini call
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: options.temperature ?? 0.2,
        responseMimeType: 'application/json',
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      logApiCall('failed', options.challengeType);
      return { success: false, data: null, error: 'No response received from AI service.' };
    }

    const data = JSON.parse(textResponse);

    // Log successful call
    logApiCall('success', options.challengeType);

    return { success: true, data };
  } catch (err: any) {
    const errorMessage = err?.message || String(err);
    const statusCode = err?.status || err?.statusCode;

    // Detect quota exhaustion (429 or specific Google error messages)
    const isQuotaError =
      statusCode === 429 ||
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('quota') ||
      errorMessage.toLowerCase().includes('rate limit') ||
      errorMessage.toLowerCase().includes('resource exhausted');

    if (isQuotaError) {
      logApiCall('quota_exhausted', options.challengeType);
      return {
        success: false,
        data: null,
        error: 'AI evaluation is temporarily unavailable due to usage limits. Please try again later.',
        quotaExhausted: true,
      };
    }

    // Generic failure
    logApiCall('failed', options.challengeType);
    console.error(`Gemini request failed [${options.challengeType}]:`, errorMessage);
    return {
      success: false,
      data: null,
      error: 'AI evaluation failed. Please try again.',
    };
  }
}
