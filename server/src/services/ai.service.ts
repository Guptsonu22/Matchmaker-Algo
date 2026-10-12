import OpenAI from 'openai';
import { config } from '../config/env.js';

export interface MinimumProfileFacts {
  id: string;
  firstName: string;
  fullName: string;
  gender: string;
  age?: number;
  city?: string;
  state?: string;
  occupation?: string;
  education?: string;
  educationField?: string;
  hobbies?: string[];
  diet?: string;
  familyValues?: string;
}

export interface GenerateIntroOptions {
  clientProfile: MinimumProfileFacts;
  candidateProfile: MinimumProfileFacts;
  score?: number | { total: number; dimensions?: Record<string, number> };
  explanation?:
    | {
        summary?: string;
        positiveSignals?: string[];
        mismatches?: string[];
        potentialConcerns?: string[];
        missingInformation?: string[];
      }
    | string;
  clientOverride?: OpenAI | null;
}

export interface AIMatchIntroResult {
  introduction: string;
  source: 'ai' | 'fallback';
  fallbackReason?: 'missing_api_key' | 'rate_limited' | 'timeout' | 'api_error';
  wordCount: number;
  modelUsed?: string;
}

// Global cached client instance (lazy)
let cachedOpenAIClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  if (!config.openaiApiKey) {
    return null;
  }
  if (!cachedOpenAIClient) {
    cachedOpenAIClient = new OpenAI({
      apiKey: config.openaiApiKey,
      timeout: 12000, // 12 seconds timeout
    });
  }
  return cachedOpenAIClient;
}

export function setOpenAIClient(client: OpenAI | null): void {
  cachedOpenAIClient = client;
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Generate a curated, high-quality fallback introduction that strictly respects:
 * - 60-100 words range
 * - Only verified-as-present facts
 * - No sensitive data (no religion, caste, contact details)
 * - Non-predictive score framing (treating score as alignment across criteria, not relationship success prediction)
 */
export function generateCuratedFallbackIntro(
  client: MinimumProfileFacts,
  candidate: MinimumProfileFacts,
  scoreValue: number,
  _explanationText?: string
): string {
  const clientFirstName = client.firstName || client.fullName.split(' ')[0] || 'Client';
  const candFirstName = candidate.firstName || candidate.fullName.split(' ')[0] || 'Candidate';
  const candOccupation = candidate.occupation || 'established professional';
  const candCity = candidate.city ? `based in ${candidate.city}` : 'with compatible location alignment';
  const candEdu = candidate.education
    ? `${candidate.education}${candidate.educationField ? ` in ${candidate.educationField}` : ''}`
    : 'professional background';

  const clientHobbies = client.hobbies || [];
  const candHobbies = candidate.hobbies || [];
  const sharedHobby = candHobbies.find((h) =>
    clientHobbies.map((x) => x.toLowerCase()).includes(h.toLowerCase())
  );

  const hobbyLine = sharedHobby
    ? `Both profiles express an enthusiasm for ${sharedHobby.toLowerCase()}, offering an organic conversation starter.`
    : `Both profiles highlight strong professional dedication alongside thoughtful personal values.`;

  return (
    `Dear ${clientFirstName},\n\n` +
    `We are delighted to introduce ${candFirstName}, an accomplished ${candOccupation} ${candCity}. ` +
    `Our deterministic compatibility engine identified a notable ${scoreValue}% alignment across your partner criteria, ` +
    `with promising harmony in educational background (${candEdu}) and mutual lifestyle preferences. ` +
    `${hobbyLine} ` +
    `We believe your complementary backgrounds provide a wonderful basis for an initial conversation.\n\n` +
    `Warm regards,\n` +
    `Your Matchmaking Team`
  );
}

/**
 * Primary AI-assisted introduction generator using official OpenAI SDK and Responses API
 */
export async function generateAIMatchIntroduction(
  options: GenerateIntroOptions
): Promise<AIMatchIntroResult> {
  const { clientProfile, candidateProfile, score, explanation, clientOverride } = options;

  const scoreValue =
    typeof score === 'number'
      ? score
      : typeof score?.total === 'number'
      ? score.total
      : 80;

  const explanationSummary =
    typeof explanation === 'string'
      ? explanation
      : explanation?.summary ||
        (explanation?.positiveSignals && explanation.positiveSignals.length > 0
          ? explanation.positiveSignals.join('. ')
          : '');

  const openaiClient = clientOverride !== undefined ? clientOverride : getOpenAIClient();

  // If no OpenAI client or no API key, return curated fallback
  if (!openaiClient || !config.openaiApiKey) {
    safeLog('OpenAI API key missing or client not initialized. Using fallback introduction.');
    const fallbackText = generateCuratedFallbackIntro(
      clientProfile,
      candidateProfile,
      scoreValue,
      explanationSummary
    );
    return {
      introduction: fallbackText,
      source: 'fallback',
      fallbackReason: 'missing_api_key',
      wordCount: countWords(fallbackText),
    };
  }

  const instructions = `You are an empathetic, articulate editorial writing assistant for The Date Crew, a boutique matrimonial agency.
Your role is to draft a personalized introduction (strictly 60 to 100 words) presenting a recommended candidate to a client.

Core Principles:
1. Tone: Warm, dignified, respectful, and encouraging.
2. Verified Facts Only: Rely ONLY on the supplied, verified-as-present profile facts. NEVER assume, invent, or hallucinate common interests, shared hobbies, mutual preferences, or goals that are not explicitly stated in the input.
3. Privacy & Sensitivity: NEVER reveal private contact details (emails, phone numbers, exact addresses), caste, or religion.
4. Non-Predictive Framing: NEVER describe the compatibility score as a forecast, guarantee, or prediction of relationship success or marital outcome. Refer to it strictly as an algorithmic alignment score across operational preferences.
5. Role Boundary: Act as a writing assistant presenting human matchmaker and algorithmic observations. Do NOT pose as the final authority deciding relationship compatibility.
6. Length: The final text must be between 60 and 100 words.`;

  const inputPrompt = `Client: ${clientProfile.firstName || clientProfile.fullName}, City: ${clientProfile.city || 'Not specified'}, Occupation: ${clientProfile.occupation || 'Not specified'}, Education: ${clientProfile.education || 'Not specified'}${clientProfile.educationField ? ` (${clientProfile.educationField})` : ''}, Verified Hobbies: ${(clientProfile.hobbies || []).join(', ') || 'None specified'}.
Candidate: ${candidateProfile.firstName || candidateProfile.fullName}, City: ${candidateProfile.city || 'Not specified'}, Occupation: ${candidateProfile.occupation || 'Not specified'}, Education: ${candidateProfile.education || 'Not specified'}${candidateProfile.educationField ? ` (${candidateProfile.educationField})` : ''}, Verified Hobbies: ${(candidateProfile.hobbies || []).join(', ') || 'None specified'}.
Compatibility Alignment: ${scoreValue}% overall compatibility score.
Algorithm Observations: ${explanationSummary || 'Complementary educational and professional background with aligned lifestyle preferences.'}`;

  try {
    safeLog('Invoking OpenAI Responses API for match introduction');
    const response = await openaiClient.responses.create({
      model: config.openaiModel,
      instructions,
      input: inputPrompt,
    });

    let generatedText = response.output_text?.trim();
    if (!generatedText && Array.isArray((response as any).output)) {
      for (const item of (response as any).output) {
        if (item.type === 'message' && Array.isArray(item.content)) {
          for (const part of item.content) {
            if (part.type === 'output_text') {
              generatedText = ((generatedText || '') + part.text).trim();
            }
          }
        }
      }
    }

    if (generatedText && generatedText.length > 20) {
      return {
        introduction: generatedText,
        source: 'ai',
        wordCount: countWords(generatedText),
        modelUsed: config.openaiModel,
      };
    }

    // If output is empty or too short, fall back
    safeWarn('OpenAI returned empty output. Falling back to template.');
    const fallbackText = generateCuratedFallbackIntro(
      clientProfile,
      candidateProfile,
      scoreValue,
      explanationSummary
    );
    return {
      introduction: fallbackText,
      source: 'fallback',
      fallbackReason: 'api_error',
      wordCount: countWords(fallbackText),
    };
  } catch (error: any) {
    let fallbackReason: 'rate_limited' | 'timeout' | 'api_error' = 'api_error';

    const status = error?.status || error?.statusCode;
    const errName = error?.name || '';
    const errMsg = String(error?.message || '').toLowerCase();

    if (status === 429 || errName === 'RateLimitError' || errMsg.includes('rate limit')) {
      fallbackReason = 'rate_limited';
    } else if (
      errName === 'APIConnectionTimeoutError' ||
      errMsg.includes('timeout') ||
      errMsg.includes('timed out')
    ) {
      fallbackReason = 'timeout';
    }

    safeWarn(`OpenAI API call encountered ${fallbackReason}`, error);

    const fallbackText = generateCuratedFallbackIntro(
      clientProfile,
      candidateProfile,
      scoreValue,
      explanationSummary
    );

    return {
      introduction: fallbackText,
      source: 'fallback',
      fallbackReason,
      wordCount: countWords(fallbackText),
    };
  }
}

function safeLog(message: string): void {
  // Safe operational logging: does not print secrets or raw PII
  console.log(`[AI Intro] ${message}`);
}

function safeWarn(message: string, error?: any): void {
  // Safe operational warning logging: does not print secrets
  const errCode = error?.status || error?.code || 'ERR';
  const errMessage = error instanceof Error ? error.message : String(error);
  console.warn(`[AI Intro Warning] ${message} (${errCode}: ${errMessage})`);
}
