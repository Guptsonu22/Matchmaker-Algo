import { Customer, Gender, Religion, Education, Diet, MaritalStatus } from '../models/Customer.model.js';

const MALE_NAMES = [
  'Aarav Mehta', 'Rohan Verma', 'Vikramaditya Sengupta', 'Kabir Singhania', 'Aditya Kulkarni',
  'Ishaan Iyer', 'Reyansh Nair', 'Vivaan Joshi', 'Karan Oberoi', 'Dhruv Banerjee',
  'Samar Choudhury', 'Armaan Saxena', 'Devansh Bhattacharya', 'Pranav Deshmukh', 'Yashvardhan Rao',
  'Harshavardhan Pillai', 'Siddharth Trivedi', 'Raghav Malhotra', 'Neil Mukherjee', 'Aniket Pandey',
  'Madhav Aggarwal', 'Rudra Nambiar', 'Shaurya Kapoor', 'Tejas Namboodiri', 'Parth Goswami',
  'Jai Narang', 'Arnav Hegde', 'Utkarsh Bajpai', 'Tushar Ahuja', 'Rishi Kaushik',
  'Gautam Somany', 'Varun Someshwar', 'Ayush Bhatia', 'Chaitanya Patwardhan', 'Manav Goenka',
  'Hardik Bhardwaj', 'Kunal Shrivastav', 'Aman Mittal', 'Chirag Parekh', 'Samarth Khandelwal',
  'Suraj Bhasin', 'Mayank Poddar', 'Nikhil Chawla', 'Abhimanyu Roy', 'Tanmay Dixit',
  'Bhavya Rane', 'Rajat Lal', 'Nirvaan Sethi', 'Ojas Kedia', 'Advait Swaminathan',
  'Shubham Gokhale', 'Saurabh Kashyap', 'Deepak Chauhan', 'Alok Mathur', 'Anshuman Roy',
  'Sanyam Vohra', 'Vishal Singhal', 'Piyush Jindal', 'Kartik Rawat', 'Hemant Thapar',
];

const FEMALE_NAMES = [
  'Ananya Deshmukh', 'Rhea Sengupta', 'Meera Subramanian', 'Tanvi Singhania', 'Ishani Kulkarni',
  'Diya Mukherjee', 'Tara Nambiar', 'Aditi Banerjee', 'Saanvi Trivedi', 'Kavya Choudhury',
  'Nandini Saxena', 'Avani Bhattacharya', 'Siya Pillai', 'Ira Joshi', 'Anushka Rao',
  'Sneha Malhotra', 'Pooja Oberoi', 'Vaishnavi Iyer', 'Simran Narang', 'Radhika Pandey',
  'Shruti Aggarwal', 'Prisha Kapoor', 'Ahana Namboodiri', 'Suhani Goswami', 'Navya Hegde',
  'Roshni Bajpai', 'Bhavna Ahuja', 'Kritika Kaushik', 'Pallavi Somany', 'Aashi Someshwar',
  'Trisha Bhatia', 'Nupur Patwardhan', 'Gayatri Goenka', 'Divya Bhardwaj', 'Gauri Shrivastav',
  'Mallika Mittal', 'Sonal Parekh', 'Vidhi Khandelwal', 'Akanksha Bhasin', 'Juhi Poddar',
  'Lavanya Chawla', 'Maitreyi Roy', 'Payal Dixit', 'Aparna Rane', 'Natasha Lal',
  'Garima Sethi', 'Saloni Kedia', 'Swati Swaminathan', 'Archana Gokhale', 'Shalini Kashyap',
  'Preeti Chauhan', 'Damini Mathur', 'Madhuri Roy', 'Karishma Vohra', 'Shipra Singhal',
  'Shweta Jindal', 'Chitrangada Rawat', 'Devika Thapar', 'Aakanksha Jain', 'Manjari Saxena',
];

const CITIES = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Chandigarh', state: 'Punjab' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
];

const RELIGIONS: Religion[] = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist'];
const MOTHER_TONGUES = ['Hindi', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Punjabi', 'Malayalam', 'Kannada'];
const OCCUPATIONS = [
  'Senior Software Architect', 'Investment Banking Analyst', 'Product Strategy Lead',
  'Pediatric Surgeon', 'Corporate Law Counsel', 'Creative Director', 'Management Consultant',
  'Civil Services Officer', 'Chartered Accountant', 'Biomedical Researcher', 'Data Science Director',
  'Aerospace Systems Engineer', 'Architect & Urban Planner', 'Fintech Product Manager',
  'Venture Capital Associate',
];
const EMPLOYERS = [
  'Google India', 'Microsoft', 'Goldman Sachs', 'McKinsey & Company', 'Tata Consultancy Services',
  'Apollo Hospitals', 'Khaitan & Co', 'Boston Consulting Group', 'Amazon Web Services',
  'Infosys Technologies', 'HDFC Bank', 'Reliance Industries', 'Independent Practice',
];
const EDUCATIONS: Education[] = ['Bachelors', 'Masters', 'PhD', 'Bachelors', 'Masters'];
const EDU_FIELDS = ['Computer Science', 'Finance & Economics', 'Medicine & Surgery', 'Corporate Law', 'Business Administration', 'Mechanical Engineering', 'Design & Architecture'];
const HOBBIES = ['Classical Music', 'Trekking', 'Reading Philosophy', 'Culinary Arts', 'Marathon Running', 'Photography', 'Badminton', 'Yoga & Meditation', 'Travel Writing', 'Chess', 'Gardening'];
const DIETS: Diet[] = ['vegetarian', 'vegetarian', 'non_vegetarian', 'eggetarian', 'vegan'];
const MARITAL_STATUSES: MaritalStatus[] = ['never_married', 'never_married', 'never_married', 'divorced'];

export async function seedCandidates(): Promise<void> {
  const totalCount = await Customer.countDocuments();
  if (totalCount >= 120) {
    console.log(`[Seed] Candidates already seeded (${totalCount} profiles exist). Skipping.`);
    return;
  }

  const profiles: any[] = [];

  // Generate 60 Male Profiles
  MALE_NAMES.forEach((name, index) => {
    const loc = CITIES[index % CITIES.length];
    const isClient = index < 20; // 20 paying clients
    const profileId = `DC-M-${(index + 101).toString().padStart(4, '0')}`;
    const age = 26 + (index % 12); // age 26 - 37
    const dob = new Date(Date.now() - age * 365.25 * 24 * 60 * 60 * 1000);
    const religion = RELIGIONS[index % RELIGIONS.length];
    const education = EDUCATIONS[index % EDUCATIONS.length];
    const income = 1200000 + (index % 8) * 450000; // ₹12L - ₹43.5L

    profiles.push({
      profileId,
      isClient,
      fullName: name,
      gender: 'male',
      dob,
      maritalStatus: MARITAL_STATUSES[index % MARITAL_STATUSES.length],
      heightCm: 168 + (index % 22),
      city: loc.city,
      state: loc.state,
      country: 'India',
      nativePlace: loc.city,
      religion,
      caste: religion === 'Hindu' ? ['Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha'][index % 4] : '',
      subCaste: '',
      motherTongue: MOTHER_TONGUES[index % MOTHER_TONGUES.length],
      isManglik: index % 5 === 0,
      education,
      educationField: EDU_FIELDS[index % EDU_FIELDS.length],
      occupation: OCCUPATIONS[index % OCCUPATIONS.length],
      employer: EMPLOYERS[index % EMPLOYERS.length],
      annualIncomeINR: income,
      familyType: index % 3 === 0 ? 'joint' : 'nuclear',
      familyValues: index % 2 === 0 ? 'moderate' : 'liberal',
      fatherOccupation: 'Senior Government Officer (Retd)',
      motherOccupation: 'Educator & Homemaker',
      numberOfSiblings: index % 3,
      diet: DIETS[index % DIETS.length],
      smoking: index % 7 === 0 ? 'occasionally' : 'no',
      drinking: index % 4 === 0 ? 'occasionally' : 'no',
      hobbies: [HOBBIES[index % HOBBIES.length], HOBBIES[(index + 3) % HOBBIES.length]],
      rashi: ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya'][index % 6],
      nakshatra: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira'][index % 5],
      selfDescription: `Driven professional valuing intellectual companionship, intellectual banter, mutual respect, and close family bonding. Passionate about ${HOBBIES[index % HOBBIES.length].toLowerCase()} on weekends.`,
      avatarSeed: `male-${index}-${name.toLowerCase().replace(/ /g, '-')}`,
      photoVisibility: 'public',
      verificationStatus: ['trust_badge', 'phone_verified', 'id_submitted'][index % 3],
      journeyStatus: isClient ? ['new', 'active', 'active', 'matched'][index % 4] : 'new',
      preferences: {
        ageMin: Math.max(22, age - 5),
        ageMax: age + 1,
        heightMinCm: 152,
        heightMaxCm: 178,
        religionAccepted: [religion],
        casteNoBar: index % 2 === 0,
        educationMin: 'Bachelors',
        incomeMinINR: 600000,
        locationPreference: [loc.city, 'Mumbai', 'Bengaluru'],
        diet: ['vegetarian', 'non_vegetarian', 'eggetarian'],
        maritalStatusAccepted: ['never_married'],
        flexibilityScore: 0.75,
      },
      onboardedAt: new Date(Date.now() - (index * 2) * 86400000),
    });
  });

  // Generate 60 Female Profiles
  FEMALE_NAMES.forEach((name, index) => {
    const loc = CITIES[(index + 3) % CITIES.length];
    const isClient = index < 20; // 20 paying clients
    const profileId = `DC-F-${(index + 101).toString().padStart(4, '0')}`;
    const age = 24 + (index % 11); // age 24 - 34
    const dob = new Date(Date.now() - age * 365.25 * 24 * 60 * 60 * 1000);
    const religion = RELIGIONS[(index + 1) % RELIGIONS.length];
    const education = EDUCATIONS[(index + 1) % EDUCATIONS.length];
    const income = 1100000 + (index % 7) * 400000; // ₹11L - ₹35L

    profiles.push({
      profileId,
      isClient,
      fullName: name,
      gender: 'female',
      dob,
      maritalStatus: MARITAL_STATUSES[index % MARITAL_STATUSES.length],
      heightCm: 155 + (index % 18),
      city: loc.city,
      state: loc.state,
      country: 'India',
      nativePlace: loc.city,
      religion,
      caste: religion === 'Hindu' ? ['Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha'][(index + 1) % 4] : '',
      subCaste: '',
      motherTongue: MOTHER_TONGUES[(index + 2) % MOTHER_TONGUES.length],
      isManglik: (index + 2) % 6 === 0,
      education,
      educationField: EDU_FIELDS[(index + 2) % EDU_FIELDS.length],
      occupation: OCCUPATIONS[(index + 2) % OCCUPATIONS.length],
      employer: EMPLOYERS[(index + 2) % EMPLOYERS.length],
      annualIncomeINR: income,
      familyType: index % 4 === 0 ? 'joint' : 'nuclear',
      familyValues: index % 3 === 0 ? 'traditional' : 'liberal',
      fatherOccupation: 'Executive Director, Public Sector',
      motherOccupation: 'Professor of Literature',
      numberOfSiblings: (index + 1) % 3,
      diet: DIETS[(index + 1) % DIETS.length],
      smoking: 'no',
      drinking: index % 5 === 0 ? 'occasionally' : 'no',
      hobbies: [HOBBIES[(index + 1) % HOBBIES.length], HOBBIES[(index + 4) % HOBBIES.length]],
      rashi: ['Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'][index % 6],
      nakshatra: ['Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha'][index % 5],
      selfDescription: `Enthusiastic professional with a global mindset yet grounded in warm cultural heritage. Looking for an ambitious partner who values candid humor and reciprocal respect.`,
      avatarSeed: `female-${index}-${name.toLowerCase().replace(/ /g, '-')}`,
      photoVisibility: 'public',
      verificationStatus: ['trust_badge', 'phone_verified', 'id_submitted'][(index + 1) % 3],
      journeyStatus: isClient ? ['new', 'active', 'matched', 'active'][index % 4] : 'new',
      preferences: {
        ageMin: age,
        ageMax: age + 6,
        heightMinCm: 165,
        heightMaxCm: 195,
        religionAccepted: [religion],
        casteNoBar: true,
        educationMin: 'Bachelors',
        incomeMinINR: 1000000,
        locationPreference: [loc.city, 'Mumbai', 'Delhi', 'Bengaluru'],
        diet: ['vegetarian', 'non_vegetarian', 'eggetarian'],
        maritalStatusAccepted: ['never_married'],
        flexibilityScore: 0.8,
      },
      onboardedAt: new Date(Date.now() - (index * 2) * 86400000),
    });
  });

  await Customer.insertMany(profiles);
  console.log(`[Seed] Inserted ${profiles.length} synthetic candidate profiles (40 clients, 80 pool candidates).`);
}
