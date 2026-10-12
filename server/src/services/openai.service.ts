import { ICustomer } from '../models/Customer.model.js';
import { IScoreSnapshot } from '../models/MatchEvent.model.js';
import { generateAIMatchIntroduction, MinimumProfileFacts } from './ai.service.js';

function toMinimumProfileFacts(customer: ICustomer): MinimumProfileFacts {
  return {
    id: customer._id.toString(),
    firstName: customer.firstName || customer.fullName.split(' ')[0],
    fullName: customer.fullName,
    gender: customer.gender,
    city: customer.city,
    state: customer.state,
    occupation: customer.occupation,
    education: customer.education,
    educationField: customer.educationField,
    hobbies: customer.hobbies || [],
    diet: customer.diet,
    familyValues: customer.familyValues,
  };
}

export async function generateIntroduction(
  client: ICustomer,
  candidate: ICustomer,
  score: IScoreSnapshot
): Promise<string> {
  const result = await generateAIMatchIntroduction({
    clientProfile: toMinimumProfileFacts(client),
    candidateProfile: toMinimumProfileFacts(candidate),
    score: score.total,
  });

  return result.introduction;
}
