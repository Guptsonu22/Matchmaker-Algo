import { ICustomer, IScoreSnapshot } from '../models/Customer.model.js';
import { calculateAge } from './matching.service.js';
import { config } from '../config/env.js';

export async function generateIntroduction(
  client: ICustomer,
  candidate: ICustomer,
  score: IScoreSnapshot
): Promise<string> {
  const clientAge = calculateAge(client.dob);
  const candAge = calculateAge(candidate.dob);

  // If OpenAI is enabled and API key is present, attempt LLM generation
  if (config.openaiEnabled && config.openaiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an empathetic, articulate matchmaker at The Date Crew, a boutique matrimonial agency in India. Write a concise, 3-4 sentence personalized introduction introducing a candidate to a client. Highlight complementary education, values, lifestyle compatibility, and location alignment. Keep tone warm, refined, and respectful.',
            },
            {
              role: 'user',
              content: `Client: ${client.fullName}, ${clientAge} yrs, ${client.city}, ${client.occupation}, Religion: ${client.religion}.
Candidate: ${candidate.fullName}, ${candAge} yrs, ${candidate.city}, ${candidate.occupation}, Religion: ${candidate.religion}.
Compatibility Score: ${score.total}% (Cultural: ${score.dimensions.culturalFit}/20, Lifestyle: ${score.dimensions.lifestyleHarmony}/15, Education: ${score.dimensions.educationAlignment}/12).`,
            },
          ],
          temperature: 0.7,
          max_tokens: 220,
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        const intro = data.choices?.[0]?.message?.content?.trim();
        if (intro) return intro;
      }
    } catch (err) {
      console.warn('[OpenAI Fallback]: Using curated matchmaker template.', err);
    }
  }

  // Refined, high-quality curated matchmaker introduction template
  const sharedHobby = (candidate.hobbies || []).find((h) =>
    (client.hobbies || []).includes(h)
  );
  const hobbyMention = sharedHobby
    ? `Both share an enthusiasm for ${sharedHobby.toLowerCase()}, offering a delightful starting ground for conversation.`
    : `Both prioritize work-life balance and deep-rooted family values.`;

  return (
    `Dear ${client.fullName.split(' ')[0]},\n\n` +
    `We are delighted to present a curated introduction to ${candidate.fullName}, a ${candidate.occupation} based in ${candidate.city}. ` +
    `Our assessment indicates a strong ${score.total}% alignment across your partner expectations, notably within educational background (${candidate.education} in ${candidate.educationField || 'Professional Studies'}) and shared cultural traditions. ` +
    `${hobbyMention} ` +
    `We believe your mutual outlook on life and complementary personalities will foster an inspiring first dialogue.\n\n` +
    `Warm regards,\n` +
    `Your Matchmaking Team at The Date Crew`
  );
}
