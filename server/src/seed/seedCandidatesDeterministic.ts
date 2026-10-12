import { Customer, Gender, Religion, Education, Diet, MaritalStatus } from '../models/Customer.model.js';
import { MatchPreference } from '../models/MatchPreference.model.js';

interface RawPerson {
  firstName: string;
  lastName: string;
  gender: Gender;
  city: string;
  state: string;
  nativePlace: string;
  religion: Religion;
  caste: string;
  motherTongue: string;
  languages: string[];
  undergraduateCollege: string;
  degree: string;
  education: Education;
  educationField: string;
  company: string;
  designation: string;
  occupation: string;
  annualIncomeINR: number;
  diet: Diet;
  maritalStatus: MaritalStatus;
  heightCm: number;
  hobbies: string[];
  siblings: string;
  numberOfSiblings: number;
  childrenPreference: string;
  relocationPreference: string;
  petPreference: string;
  careerGoals: string;
  relationshipExpectations: string;
  preferredCities: string[];
  isManglik: boolean;
  ageYears: number; // 21 - 45
}

// 60 Deterministic Fictional Male Candidates (Adults: 23–43)
const MALE_PROFILES: RawPerson[] = [
  {
    firstName: 'Aarav', lastName: 'Mehta', gender: 'male', ageYears: 29, heightCm: 178,
    city: 'Mumbai', state: 'Maharashtra', nativePlace: 'Ahmedabad', religion: 'Hindu', caste: 'Vaishya',
    motherTongue: 'Gujarati', languages: ['Gujarati', 'Hindi', 'English'],
    undergraduateCollege: 'IIT Bombay', degree: 'B.Tech & M.Tech Dual Degree', education: 'Masters', educationField: 'Computer Science',
    company: 'Google India', designation: 'Senior Staff Engineer', occupation: 'Software Architect', annualIncomeINR: 3800000,
    diet: 'vegetarian', maritalStatus: 'never_married', siblings: '1 Elder Sister (Married)', numberOfSiblings: 1,
    childrenPreference: 'Wants 2 children in future', relocationPreference: 'Open to relocating within India or Singapore',
    petPreference: 'Loves dogs, open to pets', isManglik: false,
    hobbies: ['Badminton', 'Trekking', 'Guitar'],
    careerGoals: 'Aspiring to lead core distributed systems and mentor engineering talent.',
    relationshipExpectations: 'Looking for an ambitious, kind partner who values mutual respect and humor.',
    preferredCities: ['Mumbai', 'Bengaluru', 'Pune'],
  },
  {
    firstName: 'Rohan', lastName: 'Verma', gender: 'male', ageYears: 31, heightCm: 182,
    city: 'Bengaluru', state: 'Karnataka', nativePlace: 'Lucknow', religion: 'Hindu', caste: 'Kayastha',
    motherTongue: 'Hindi', languages: ['Hindi', 'English'],
    undergraduateCollege: 'BITS Pilani', degree: 'B.E. Electrical', education: 'Bachelors', educationField: 'Electrical Engineering',
    company: 'Microsoft India', designation: 'Principal Product Manager', occupation: 'Product Strategy Lead', annualIncomeINR: 4200000,
    diet: 'non_vegetarian', maritalStatus: 'never_married', siblings: '1 Younger Brother (Engineer)', numberOfSiblings: 1,
    childrenPreference: 'Wants children after 2-3 years of marriage', relocationPreference: 'Prefers staying in Bengaluru or Hyderabad',
    petPreference: 'Pet friendly', isManglik: false,
    hobbies: ['Marathon Running', 'Coffee Brewing', 'Reading History'],
    careerGoals: 'Aiming for executive product leadership in global cloud platforms.',
    relationshipExpectations: 'Seeking an empathetic, communicative partner who shares a passion for travel.',
    preferredCities: ['Bengaluru', 'Hyderabad', 'Delhi'],
  },
  {
    firstName: 'Vikramaditya', lastName: 'Sengupta', gender: 'male', ageYears: 34, heightCm: 175,
    city: 'Kolkata', state: 'West Bengal', nativePlace: 'Kolkata', religion: 'Hindu', caste: 'Brahmin',
    motherTongue: 'Bengali', languages: ['Bengali', 'Hindi', 'English'],
    undergraduateCollege: 'St. Xavier’s College Kolkata', degree: 'M.Sc Economics', education: 'Masters', educationField: 'Economics & Finance',
    company: 'Goldman Sachs', designation: 'Vice President, Equity Research', occupation: 'Investment Banker', annualIncomeINR: 4500000,
    diet: 'non_vegetarian', maritalStatus: 'never_married', siblings: 'Only Child', numberOfSiblings: 0,
    childrenPreference: 'Open to discussion with partner', relocationPreference: 'Willing to relocate internationally or Mumbai',
    petPreference: 'Comfortable with cats and dogs', isManglik: false,
    hobbies: ['Classical Music', 'Chess', 'Art Curation'],
    careerGoals: 'Building long-term wealth strategies and macro research publications.',
    relationshipExpectations: 'Value emotional maturity, cultural curiosity, and close family ties.',
    preferredCities: ['Kolkata', 'Mumbai', 'London'],
  },
  {
    firstName: 'Kabir', lastName: 'Singhania', gender: 'male', ageYears: 36, heightCm: 180,
    city: 'Delhi', state: 'Delhi', nativePlace: 'Jaipur', religion: 'Hindu', caste: 'Kshatriya',
    motherTongue: 'Hindi', languages: ['Hindi', 'English', 'Rajasthani'],
    undergraduateCollege: 'National Law University Delhi', degree: 'LL.B & LL.M', education: 'Masters', educationField: 'Corporate Law',
    company: 'Shardul Amarchand Mangaldas', designation: 'Senior Partner', occupation: 'Corporate Attorney', annualIncomeINR: 5200000,
    diet: 'vegetarian', maritalStatus: 'divorced', siblings: '1 Elder Brother (Doctor)', numberOfSiblings: 1,
    childrenPreference: 'Has no children, wants children', relocationPreference: 'Based permanently in Delhi NCR',
    petPreference: 'Loves animals', isManglik: true,
    hobbies: ['Squash', 'Wine Tasting', 'Polo'],
    careerGoals: 'Specializing in cross-border antitrust and international arbitration.',
    relationshipExpectations: 'Honesty, transparency, emotional warmth, and mutual life goals.',
    preferredCities: ['Delhi', 'Gurugram', 'Jaipur'],
  },
  {
    firstName: 'Aditya', lastName: 'Kulkarni', gender: 'male', ageYears: 27, heightCm: 172,
    city: 'Pune', state: 'Maharashtra', nativePlace: 'Kolhapur', religion: 'Hindu', caste: 'Brahmin',
    motherTongue: 'Marathi', languages: ['Marathi', 'Hindi', 'English'],
    undergraduateCollege: 'COEP Technological University', degree: 'B.Tech Mechanical', education: 'Bachelors', educationField: 'Robotics',
    company: 'Tata Motors EV Division', designation: 'Lead Systems Architect', occupation: 'Automotive Engineer', annualIncomeINR: 1900000,
    diet: 'vegetarian', maritalStatus: 'never_married', siblings: '2 Younger Sisters', numberOfSiblings: 2,
    childrenPreference: 'Definitely wants children', relocationPreference: 'Prefers Maharashtra or Germany',
    petPreference: 'No pets at home currently, but open', isManglik: false,
    hobbies: ['Motorcycle Touring', 'Robotics DIY', 'Photography'],
    careerGoals: 'Designing zero-emission commercial mobility architectures.',
    relationshipExpectations: 'Looking for a simple, career-oriented partner with cheerful energy.',
    preferredCities: ['Pune', 'Mumbai', 'Bengaluru'],
  },
  {
    firstName: 'Ishaan', lastName: 'Iyer', gender: 'male', ageYears: 30, heightCm: 176,
    city: 'Chennai', state: 'Tamil Nadu', nativePlace: 'Palakkad', religion: 'Hindu', caste: 'Brahmin',
    motherTongue: 'Tamil', languages: ['Tamil', 'Malayalam', 'English', 'Hindi'],
    undergraduateCollege: 'IIT Madras', degree: 'M.S. Data Science', education: 'Masters', educationField: 'Artificial Intelligence',
    company: 'Amazon Web Services', designation: 'Applied Research Scientist', occupation: 'Data Scientist', annualIncomeINR: 3600000,
    diet: 'vegetarian', maritalStatus: 'never_married', siblings: '1 Younger Sister (Doctor)', numberOfSiblings: 1,
    childrenPreference: 'Wants 1 or 2 children', relocationPreference: 'Open to Chennai or Seattle',
    petPreference: 'Pet lover', isManglik: false,
    hobbies: ['Carnatic Flute', 'Badminton', 'Board Games'],
    careerGoals: 'Pioneering multimodal AI applications for healthcare diagnostics.',
    relationshipExpectations: 'Cherishes traditional cultural foundation blended with modern equality.',
    preferredCities: ['Chennai', 'Bengaluru', 'Hyderabad'],
  },
  {
    firstName: 'Farhan', lastName: 'Qureshi', gender: 'male', ageYears: 32, heightCm: 177,
    city: 'Hyderabad', state: 'Telangana', nativePlace: 'Hyderabad', religion: 'Muslim', caste: 'Shaikh',
    motherTongue: 'Urdu', languages: ['Urdu', 'Hindi', 'Telugu', 'English'],
    undergraduateCollege: 'Osmania University', degree: 'M.D. Pediatrics', education: 'Masters', educationField: 'Medicine & Surgery',
    company: 'Apollo Hospitals', designation: 'Consultant Pediatric Surgeon', occupation: 'Surgeon', annualIncomeINR: 4100000,
    diet: 'non_vegetarian', maritalStatus: 'never_married', siblings: '2 Brothers (Both Doctors)', numberOfSiblings: 2,
    childrenPreference: 'Wants children', relocationPreference: 'Established in Hyderabad',
    petPreference: 'Open to birds or fish', isManglik: false,
    hobbies: ['Gardening', 'Sufi Poetry', 'Cricket'],
    careerGoals: 'Providing pediatric specialty care and establishing a charitable child clinic.',
    relationshipExpectations: 'Looking for a cultured, compassionate partner who values family unity.',
    preferredCities: ['Hyderabad', 'Bengaluru', 'Dubai'],
  },
  {
    firstName: 'Gurpreet', lastName: 'Singh Dhillon', gender: 'male', ageYears: 28, heightCm: 185,
    city: 'Chandigarh', state: 'Punjab', nativePlace: 'Amritsar', religion: 'Sikh', caste: 'Jat Sikh',
    motherTongue: 'Punjabi', languages: ['Punjabi', 'Hindi', 'English'],
    undergraduateCollege: 'Punjab Engineering College', degree: 'B.Tech Civil Engineering', education: 'Bachelors', educationField: 'Structural Engineering',
    company: 'Larsen & Toubro Infra', designation: 'Project Director', occupation: 'Civil Engineer', annualIncomeINR: 2400000,
    diet: 'vegetarian', maritalStatus: 'never_married', siblings: '1 Elder Sister', numberOfSiblings: 1,
    childrenPreference: 'Wants children', relocationPreference: 'Prefers North India or Canada',
    petPreference: 'Huge dog lover (has Golden Retriever)', isManglik: false,
    hobbies: ['Bhangra', 'Gym Training', 'Agriculture Tech'],
    careerGoals: 'Leading landmark green urban infrastructure development across North India.',
    relationshipExpectations: 'Warm-hearted, down-to-earth partner who enjoys family gatherings and festivals.',
    preferredCities: ['Chandigarh', 'Delhi', 'Toronto'],
  },
  {
    firstName: 'Devendra', lastName: 'Jain', gender: 'male', ageYears: 33, heightCm: 173,
    city: 'Jaipur', state: 'Rajasthan', nativePlace: 'Bikaner', religion: 'Jain', caste: 'Oswal',
    motherTongue: 'Hindi', languages: ['Hindi', 'English', 'Marwari'],
    undergraduateCollege: 'Shri Ram College of Commerce (SRCC)', degree: 'Chartered Accountant (FCA)', education: 'Masters', educationField: 'Accounting & Taxation',
    company: 'PricewaterhouseCoopers (PwC)', designation: 'Senior Tax Director', occupation: 'Chartered Accountant', annualIncomeINR: 3500000,
    diet: 'vegetarian', maritalStatus: 'never_married', siblings: '1 Younger Brother (CA)', numberOfSiblings: 1,
    childrenPreference: 'Wants children', relocationPreference: 'Comfortable with Jaipur or Delhi NCR',
    petPreference: 'Strict vegetarian household, non-pet preferred', isManglik: false,
    hobbies: ['Heritage Walking', 'Table Tennis', 'Meditation'],
    careerGoals: 'Heading direct tax advisory and international treaty structuring.',
    relationshipExpectations: 'Looking for someone who respects Jain tenets and enjoys an active social circle.',
    preferredCities: ['Jaipur', 'Delhi', 'Ahmedabad'],
  },
  {
    firstName: 'Joshua', lastName: 'Fernandes', gender: 'male', ageYears: 29, heightCm: 179,
    city: 'Panaji', state: 'Goa', nativePlace: 'Goa', religion: 'Christian', caste: 'Roman Catholic',
    motherTongue: 'Konkani', languages: ['Konkani', 'English', 'Portuguese', 'Hindi'],
    undergraduateCollege: 'St. Xavier’s College Mapusa', degree: 'B.A. Architecture', education: 'Bachelors', educationField: 'Sustainable Architecture',
    company: 'Studio Lotus Sustainable Design', designation: 'Senior Urban Architect', occupation: 'Architect', annualIncomeINR: 2200000,
    diet: 'non_vegetarian', maritalStatus: 'never_married', siblings: '1 Elder Sister (Teacher)', numberOfSiblings: 1,
    childrenPreference: 'Wants 1 or 2 children', relocationPreference: 'Goa or Mumbai preferred',
    petPreference: 'Must love dogs', isManglik: false,
    hobbies: ['Surfing', 'Acoustic Guitar', 'Baking Sourdough'],
    careerGoals: 'Establishing an award-winning eco-resort architectural studio in the coastal belt.',
    relationshipExpectations: 'Values creative passions, gentle communication, and slow-paced lifestyle.',
    preferredCities: ['Panaji', 'Mumbai', 'Bengaluru'],
  },
];

// Dynamically generate the remaining 50 males to hit 60 diverse male profiles
const MALE_FIRST_NAMES = [
  'Vivaan', 'Karan', 'Dhruv', 'Samar', 'Armaan', 'Devansh', 'Pranav', 'Yashvardhan', 'Harshavardhan', 'Siddharth',
  'Raghav', 'Neil', 'Aniket', 'Madhav', 'Rudra', 'Shaurya', 'Tejas', 'Parth', 'Jai', 'Arnav',
  'Utkarsh', 'Tushar', 'Rishi', 'Gautam', 'Varun', 'Ayush', 'Chaitanya', 'Manav', 'Hardik', 'Kunal',
  'Aman', 'Chirag', 'Samarth', 'Suraj', 'Mayank', 'Nikhil', 'Abhimanyu', 'Tanmay', 'Bhavya', 'Rajat',
  'Nirvaan', 'Ojas', 'Advait', 'Shubham', 'Saurabh', 'Deepak', 'Alok', 'Anshuman', 'Sanyam', 'Vishal',
];

const MALE_LAST_NAMES = [
  'Joshi', 'Oberoi', 'Banerjee', 'Choudhury', 'Saxena', 'Bhattacharya', 'Deshmukh', 'Rao', 'Pillai', 'Trivedi',
  'Malhotra', 'Mukherjee', 'Pandey', 'Aggarwal', 'Nambiar', 'Kapoor', 'Namboodiri', 'Goswami', 'Narang', 'Hegde',
  'Bajpai', 'Ahuja', 'Kaushik', 'Somany', 'Someshwar', 'Bhatia', 'Patwardhan', 'Goenka', 'Bhardwaj', 'Shrivastav',
  'Mittal', 'Parekh', 'Khandelwal', 'Bhasin', 'Poddar', 'Chawla', 'Roy', 'Dixit', 'Rane', 'Lal',
  'Sethi', 'Kedia', 'Swaminathan', 'Gokhale', 'Kashyap', 'Chauhan', 'Mathur', 'Vohra', 'Singhal', 'Jindal',
];

const CITIES_LIST = [
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
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
];

const COLLEGES = [
  'IIT Delhi', 'IIT Kharagpur', 'IIT Roorkee', 'IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta',
  'SRCC Delhi', 'St. Stephen’s College', 'Symbiosis Pune', 'XLRI Jamshedpur', 'BITS Goa',
  'Manipal Institute of Tech', 'Vellore Institute of Tech (VIT)', 'National Institute of Design (NID)',
];

const PROFESSIONS = [
  { occ: 'Cloud Solutions Architect', comp: 'Amazon AWS', desig: 'Senior Lead' },
  { occ: 'Management Consultant', comp: 'McKinsey & Co', desig: 'Engagement Manager' },
  { occ: 'Fintech Product Manager', comp: 'Razorpay', desig: 'Lead Product Manager' },
  { occ: 'Orthopedic Surgeon', comp: 'Fortis Healthcare', desig: 'Attending Surgeon' },
  { occ: 'Chartered Accountant', comp: 'Deloitte India', desig: 'Audit Partner' },
  { occ: 'Creative Director', comp: 'Ogilvy India', desig: 'Group Head' },
  { occ: 'Civil Services Officer', comp: 'Govt of India (IAS/IPS)', desig: 'Deputy Secretary' },
  { occ: 'Biotech Scientist', comp: 'Biocon Labs', desig: 'Principal Investigator' },
  { occ: 'Venture Capital Associate', comp: 'Sequoia Surge', desig: 'Senior Associate' },
  { occ: 'Aerospace Systems Engineer', comp: 'ISRO / Skyroot Aerospace', desig: 'Scientist SC' },
];

for (let i = 0; i < 50; i++) {
  const loc = CITIES_LIST[i % CITIES_LIST.length];
  const prof = PROFESSIONS[i % PROFESSIONS.length];
  const ageYears = 24 + (i % 18); // 24 to 41
  const heightCm = 168 + (i % 20);

  MALE_PROFILES.push({
    firstName: MALE_FIRST_NAMES[i],
    lastName: MALE_LAST_NAMES[i],
    gender: 'male',
    ageYears,
    heightCm,
    city: loc.city,
    state: loc.state,
    nativePlace: loc.city,
    religion: ['Hindu', 'Hindu', 'Muslim', 'Sikh', 'Jain', 'Christian'][i % 6] as Religion,
    caste: ['Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Patel', 'Reddy'][i % 6],
    motherTongue: ['Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Punjabi'][i % 7],
    languages: ['English', 'Hindi'],
    undergraduateCollege: COLLEGES[i % COLLEGES.length],
    degree: 'Bachelors & Masters',
    education: ['Bachelors', 'Masters', 'Masters', 'PhD'][i % 4] as Education,
    educationField: 'Professional Degree',
    company: prof.comp,
    designation: prof.desig,
    occupation: prof.occ,
    annualIncomeINR: 1400000 + (i % 8) * 350000,
    diet: ['vegetarian', 'vegetarian', 'non_vegetarian', 'eggetarian'][i % 4] as Diet,
    maritalStatus: i % 8 === 0 ? 'divorced' : 'never_married',
    siblings: i % 3 === 0 ? '1 Brother' : i % 3 === 1 ? '1 Sister' : 'None',
    numberOfSiblings: i % 3 === 2 ? 0 : 1,
    childrenPreference: 'Wants children in future',
    relocationPreference: 'Open to relocating for the right career opportunity',
    petPreference: 'Pet friendly',
    isManglik: i % 5 === 0,
    hobbies: ['Badminton', 'Reading', 'Photography', 'Travel'],
    careerGoals: `Aiming for leadership growth in ${prof.occ}.`,
    relationshipExpectations: 'Mutual respect, trust, open communication, and cheerful companionship.',
    preferredCities: [loc.city, 'Mumbai', 'Bengaluru'],
  });
}

// 60 Deterministic Fictional Female Candidates (Adults: 22–42)
const FEMALE_PROFILES: RawPerson[] = [
  {
    firstName: 'Ananya', lastName: 'Deshmukh', gender: 'female', ageYears: 27, heightCm: 165,
    city: 'Mumbai', state: 'Maharashtra', nativePlace: 'Pune', religion: 'Hindu', caste: 'Maratha',
    motherTongue: 'Marathi', languages: ['Marathi', 'Hindi', 'English'],
    undergraduateCollege: 'St. Xavier’s College Mumbai', degree: 'M.Sc Data Science', education: 'Masters', educationField: 'Data Science & AI',
    company: 'Microsoft', designation: 'Senior AI Engineer', occupation: 'Machine Learning Engineer', annualIncomeINR: 2800000,
    diet: 'vegetarian', maritalStatus: 'never_married', siblings: '1 Younger Brother (Student)', numberOfSiblings: 1,
    childrenPreference: 'Wants children after settling down', relocationPreference: 'Open to Mumbai, Pune, or Bengaluru',
    petPreference: 'Loves dogs and cats', isManglik: false,
    hobbies: ['Classical Bharatnatyam', 'Hiking', 'Specialty Coffee'],
    careerGoals: 'Building ethical generative AI products that positively impact public services.',
    relationshipExpectations: 'Looking for a thoughtful, progressive partner who values humor, equality, and kindness.',
    preferredCities: ['Mumbai', 'Pune', 'Bengaluru'],
  },
  {
    firstName: 'Rhea', lastName: 'Sengupta', gender: 'female', ageYears: 29, heightCm: 168,
    city: 'Bengaluru', state: 'Karnataka', nativePlace: 'Kolkata', religion: 'Hindu', caste: 'Brahmin',
    motherTongue: 'Bengali', languages: ['Bengali', 'Hindi', 'English'],
    undergraduateCollege: 'Presidency University Kolkata', degree: 'MBA in Marketing', education: 'Masters', educationField: 'Brand Strategy',
    company: 'Unilever India', designation: 'Senior Brand Manager', occupation: 'Brand Strategist', annualIncomeINR: 3200000,
    diet: 'non_vegetarian', maritalStatus: 'never_married', siblings: 'Only Child', numberOfSiblings: 0,
    childrenPreference: 'Wants 1 or 2 children', relocationPreference: 'Willing to relocate within top metros',
    petPreference: 'Pet lover', isManglik: false,
    hobbies: ['Culinary Arts', 'Scuba Diving', 'Indie Film Screening'],
    careerGoals: 'Leading global brand narratives and consumer sustainable innovation.',
    relationshipExpectations: 'Desires a partner who is emotionally present, ambitious, and shares an appetite for adventure.',
    preferredCities: ['Bengaluru', 'Mumbai', 'Kolkata'],
  },
  {
    firstName: 'Meera', lastName: 'Subramanian', gender: 'female', ageYears: 32, heightCm: 162,
    city: 'Chennai', state: 'Tamil Nadu', nativePlace: 'Madurai', religion: 'Hindu', caste: 'Brahmin',
    motherTongue: 'Tamil', languages: ['Tamil', 'English', 'Hindi'],
    undergraduateCollege: 'Madras Medical College', degree: 'M.D. Dermatology', education: 'Masters', educationField: 'Dermatological Medicine',
    company: 'Apollo Clinic & Private Practice', designation: 'Consultant Dermatologist', occupation: 'Dermatologist', annualIncomeINR: 3600000,
    diet: 'vegetarian', maritalStatus: 'never_married', siblings: '1 Elder Sister (Architect)', numberOfSiblings: 1,
    childrenPreference: 'Definitely wants children', relocationPreference: 'Chennai or Bengaluru preferred',
    petPreference: 'Comfortable with small pets', isManglik: false,
    hobbies: ['Carnatic Vocal', 'Gardening', 'Yoga'],
    careerGoals: 'Expanding clinical aesthetic research and community skin healthcare.',
    relationshipExpectations: 'Looking for an intellectually compatible, grounded partner with deep family values.',
    preferredCities: ['Chennai', 'Bengaluru', 'Coimbatore'],
  },
  {
    firstName: 'Tanvi', lastName: 'Singhania', gender: 'female', ageYears: 30, heightCm: 170,
    city: 'Delhi', state: 'Delhi', nativePlace: 'Jaipur', religion: 'Hindu', caste: 'Vaishya',
    motherTongue: 'Hindi', languages: ['Hindi', 'English', 'French'],
    undergraduateCollege: 'Lady Shri Ram College (LSR)', degree: 'M.A. Economics', education: 'Masters', educationField: 'Quantitative Finance',
    company: 'Bain & Company', designation: 'Senior Consultant', occupation: 'Strategy Consultant', annualIncomeINR: 4100000,
    diet: 'vegetarian', maritalStatus: 'never_married', siblings: '1 Elder Brother (Entrepreneur)', numberOfSiblings: 1,
    childrenPreference: 'Wants children', relocationPreference: 'Delhi NCR or London',
    petPreference: 'Has a rescue dog, pet friendly essential', isManglik: true,
    hobbies: ['Equestrian Riding', 'Contemporary Literature', 'Pottery'],
    careerGoals: 'Driving private equity turnaround strategies and impact investments.',
    relationshipExpectations: 'Cherishes witty dinner conversations, travel companionship, and equal partnership.',
    preferredCities: ['Delhi', 'Gurugram', 'Mumbai'],
  },
  {
    firstName: 'Aasiya', lastName: 'Mirza', gender: 'female', ageYears: 28, heightCm: 164,
    city: 'Hyderabad', state: 'Telangana', nativePlace: 'Hyderabad', religion: 'Muslim', caste: 'Syed',
    motherTongue: 'Urdu', languages: ['Urdu', 'Telugu', 'Hindi', 'English'],
    undergraduateCollege: 'BITS Hyderabad', degree: 'B.E. Computer Science', education: 'Bachelors', educationField: 'Software Systems',
    company: 'Salesforce India', designation: 'Lead Cloud Architect', occupation: 'Cloud Architect', annualIncomeINR: 3000000,
    diet: 'non_vegetarian', maritalStatus: 'never_married', siblings: '2 Younger Brothers', numberOfSiblings: 2,
    childrenPreference: 'Wants children', relocationPreference: 'Prefers Hyderabad or Dubai',
    petPreference: 'Open to cats', isManglik: false,
    hobbies: ['Calligraphy', 'Astronomy', 'Badminton'],
    careerGoals: 'Architecting zero-downtime distributed enterprise software.',
    relationshipExpectations: 'Warm, respectful partner with a strong moral compass and career aspirations.',
    preferredCities: ['Hyderabad', 'Bengaluru', 'Dubai'],
  },
  {
    firstName: 'Simran', lastName: 'Kaur Bedi', gender: 'female', ageYears: 29, heightCm: 172,
    city: 'Chandigarh', state: 'Punjab', nativePlace: 'Patiala', religion: 'Sikh', caste: 'Khatri Sikh',
    motherTongue: 'Punjabi', languages: ['Punjabi', 'Hindi', 'English'],
    undergraduateCollege: 'Panjab University', degree: 'Ph.D. Biotechnology', education: 'PhD', educationField: 'Agricultural Genetics',
    company: 'Punjab Agricultural Research', designation: 'Senior Research Fellow', occupation: 'Biotechnologist', annualIncomeINR: 2100000,
    diet: 'vegetarian', maritalStatus: 'never_married', siblings: '1 Sister (Physiotherapist)', numberOfSiblings: 1,
    childrenPreference: 'Wants children', relocationPreference: 'North India or Canada',
    petPreference: 'Loves dogs', isManglik: false,
    hobbies: ['Painting', 'Baking', 'Cycling'],
    careerGoals: 'Developing drought-resistant organic grain strains.',
    relationshipExpectations: 'Looking for a joyful, supportive partner who respects academic passions and family traditions.',
    preferredCities: ['Chandigarh', 'Delhi', 'Ludhiana'],
  },
  {
    firstName: 'Pooja', lastName: 'Kothari', gender: 'female', ageYears: 26, heightCm: 160,
    city: 'Ahmedabad', state: 'Gujarat', nativePlace: 'Surat', religion: 'Jain', caste: 'Shwetambar',
    motherTongue: 'Gujarati', languages: ['Gujarati', 'Hindi', 'English'],
    undergraduateCollege: 'IIM Indore (IPM)', degree: 'Integrated MBA', education: 'Masters', educationField: 'Strategic Finance',
    company: 'Kotak Mahindra Bank', designation: 'Wealth Advisory Lead', occupation: 'Investment Advisory Lead', annualIncomeINR: 2400000,
    diet: 'vegetarian', maritalStatus: 'never_married', siblings: '1 Elder Brother', numberOfSiblings: 1,
    childrenPreference: 'Wants children', relocationPreference: 'Gujarat or Mumbai',
    petPreference: 'Vegetarian home, no pets preferred', isManglik: false,
    hobbies: ['Classical Sitar', 'Origami', 'Swimming'],
    careerGoals: 'Managing ultra-high-net-worth portfolio allocations and financial literacy drives.',
    relationshipExpectations: 'Simple, compassionate partner who observes cultural customs and loves family dinners.',
    preferredCities: ['Ahmedabad', 'Mumbai', 'Surat'],
  },
  {
    firstName: 'Natasha', lastName: 'D’Souza', gender: 'female', ageYears: 31, heightCm: 167,
    city: 'Panaji', state: 'Goa', nativePlace: 'Mangalore', religion: 'Christian', caste: 'Roman Catholic',
    motherTongue: 'English', languages: ['English', 'Konkani', 'Hindi'],
    undergraduateCollege: 'Sophia College Mumbai', degree: 'M.A. Clinical Psychology', education: 'Masters', educationField: 'Cognitive Behavioral Therapy',
    company: 'MindCare Global Wellness', designation: 'Senior Clinical Psychotherapist', occupation: 'Psychotherapist', annualIncomeINR: 2300000,
    diet: 'non_vegetarian', maritalStatus: 'divorced', siblings: '1 Brother (Marine Engineer)', numberOfSiblings: 1,
    childrenPreference: 'No children from previous marriage, open to children', relocationPreference: 'Goa or Mumbai',
    petPreference: 'Owns two rescued cats, loves pets', isManglik: false,
    hobbies: ['Scuba Diving', 'Watercolor Sketching', 'Bossa Nova'],
    careerGoals: 'Establishing a holistic mental wellness retreat center in coastal India.',
    relationshipExpectations: 'Emotional depth, kindness, healthy boundaries, and authentic mutual care.',
    preferredCities: ['Panaji', 'Mumbai', 'Bengaluru'],
  },
];

// Dynamically generate the remaining 52 females to hit 60 diverse female profiles
const FEMALE_FIRST_NAMES = [
  'Ishani', 'Diya', 'Tara', 'Aditi', 'Saanvi', 'Kavya', 'Nandini', 'Avani', 'Siya', 'Ira',
  'Anushka', 'Sneha', 'Pooja', 'Vaishnavi', 'Radhika', 'Shruti', 'Prisha', 'Ahana', 'Suhani', 'Navya',
  'Roshni', 'Bhavna', 'Kritika', 'Pallavi', 'Aashi', 'Trisha', 'Nupur', 'Gayatri', 'Divya', 'Gauri',
  'Mallika', 'Sonal', 'Vidhi', 'Akanksha', 'Juhi', 'Lavanya', 'Maitreyi', 'Payal', 'Aparna', 'Garima',
  'Saloni', 'Swati', 'Archana', 'Shalini', 'Preeti', 'Damini', 'Madhuri', 'Karishma', 'Shipra', 'Shweta',
  'Chitrangada', 'Devika',
];

const FEMALE_LAST_NAMES = [
  'Kulkarni', 'Mukherjee', 'Nambiar', 'Banerjee', 'Trivedi', 'Choudhury', 'Saxena', 'Bhattacharya', 'Pillai', 'Rao',
  'Malhotra', 'Oberoi', 'Iyer', 'Pandey', 'Aggarwal', 'Kapoor', 'Namboodiri', 'Goswami', 'Hegde', 'Bajpai',
  'Ahuja', 'Kaushik', 'Somany', 'Someshwar', 'Bhatia', 'Patwardhan', 'Goenka', 'Bhardwaj', 'Shrivastav', 'Mittal',
  'Parekh', 'Khandelwal', 'Bhasin', 'Poddar', 'Chawla', 'Roy', 'Dixit', 'Rane', 'Lal', 'Sethi',
  'Kedia', 'Swaminathan', 'Gokhale', 'Kashyap', 'Chauhan', 'Mathur', 'Roy', 'Vohra', 'Singhal', 'Jindal',
  'Rawat', 'Thapar',
];

for (let i = 0; i < 52; i++) {
  const loc = CITIES_LIST[(i + 4) % CITIES_LIST.length];
  const prof = PROFESSIONS[(i + 3) % PROFESSIONS.length];
  const ageYears = 23 + (i % 18); // 23 to 40
  const heightCm = 155 + (i % 18);

  FEMALE_PROFILES.push({
    firstName: FEMALE_FIRST_NAMES[i],
    lastName: FEMALE_LAST_NAMES[i],
    gender: 'female',
    ageYears,
    heightCm,
    city: loc.city,
    state: loc.state,
    nativePlace: loc.city,
    religion: ['Hindu', 'Hindu', 'Muslim', 'Christian', 'Jain', 'Sikh'][i % 6] as Religion,
    caste: ['Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Nair', 'Iyer'][i % 6],
    motherTongue: ['Hindi', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Malayalam'][i % 7],
    languages: ['English', 'Hindi'],
    undergraduateCollege: COLLEGES[(i + 2) % COLLEGES.length],
    degree: 'Bachelors & Masters',
    education: ['Bachelors', 'Masters', 'Masters', 'PhD'][i % 4] as Education,
    educationField: 'Professional Degree',
    company: prof.comp,
    designation: prof.desig,
    occupation: prof.occ,
    annualIncomeINR: 1300000 + (i % 7) * 320000,
    diet: ['vegetarian', 'vegetarian', 'non_vegetarian', 'eggetarian'][i % 4] as Diet,
    maritalStatus: i % 9 === 0 ? 'divorced' : 'never_married',
    siblings: i % 3 === 0 ? '1 Sister' : i % 3 === 1 ? '1 Brother' : 'None',
    numberOfSiblings: i % 3 === 2 ? 0 : 1,
    childrenPreference: 'Wants children in future',
    relocationPreference: 'Open to relocating within India or abroad',
    petPreference: 'Pet friendly',
    isManglik: i % 6 === 0,
    hobbies: ['Yoga', 'Reading', 'Travel', 'Art'],
    careerGoals: `Aiming for excellence as a ${prof.occ}.`,
    relationshipExpectations: 'Mutual respect, shared laughter, honesty, and emotional maturity.',
    preferredCities: [loc.city, 'Mumbai', 'Delhi', 'Bengaluru'],
  });
}

export async function seedDeterministicCandidates(): Promise<{
  insertedCount: number;
  totalCandidates: number;
  totalPreferences: number;
}> {
  const allProfiles: RawPerson[] = [...MALE_PROFILES, ...FEMALE_PROFILES];

  let insertedCount = 0;

  for (let i = 0; i < allProfiles.length; i++) {
    const p = allProfiles[i];
    const isMale = p.gender === 'male';
    const numIndex = isMale ? (i + 101) : (i - MALE_PROFILES.length + 101);
    const profileId = `DC-${isMale ? 'M' : 'F'}-${numIndex.toString().padStart(4, '0')}`;

    // Fictional email & phone (Guaranteed non-real)
    const sanitizedName = `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}`;
    const fictionalEmail = `${sanitizedName}.${profileId.toLowerCase()}@fictional-demo-datecrew.in`;
    const fictionalPhone = `+91-98000-${(50000 + i).toString()}`;

    // Adult DOB calculation (between 21 and 45)
    const clampedAge = Math.min(45, Math.max(21, p.ageYears));
    const dob = new Date(Date.now() - clampedAge * 365.25 * 24 * 60 * 60 * 1000);

    const isClient = (isMale && i < 20) || (!isMale && (i - MALE_PROFILES.length) < 20);

    const partnerPreferencesPayload = {
      ageMin: isMale ? Math.max(21, clampedAge - 6) : clampedAge,
      ageMax: isMale ? clampedAge : Math.min(45, clampedAge + 7),
      heightMinCm: isMale ? 152 : 165,
      heightMaxCm: isMale ? 175 : 195,
      religionAccepted: [p.religion],
      casteNoBar: true,
      educationMin: 'Bachelors' as Education,
      incomeMinINR: isMale ? 500000 : 1000000,
      locationPreference: p.preferredCities,
      diet: ['vegetarian', 'non_vegetarian', 'eggetarian'] as Diet[],
      maritalStatusAccepted: ['never_married'] as MaritalStatus[],
      flexibilityScore: 0.8,
      preferredCities: p.preferredCities,
      childrenPreferenceAccepted: ['Wants children', 'Open to children'],
      relocationPreferenceAccepted: ['Within India', 'Open to relocate'],
      petPreferenceAccepted: ['Pet friendly'],
    };

    const customerDoc = {
      profileId,
      isClient,
      isSynthetic: true, // Marked as synthetic
      firstName: p.firstName,
      lastName: p.lastName,
      fullName: `${p.firstName} ${p.lastName}`,
      gender: p.gender,
      dob,
      maritalStatus: p.maritalStatus,
      heightCm: p.heightCm,
      email: fictionalEmail,
      phone: fictionalPhone,
      country: 'India',
      city: p.city,
      state: p.state,
      nativePlace: p.nativePlace,
      undergraduateCollege: p.undergraduateCollege,
      degree: p.degree,
      education: p.education,
      educationField: p.educationField,
      annualIncomeINR: p.annualIncomeINR,
      company: p.company,
      designation: p.designation,
      occupation: p.occupation,
      employer: p.company,
      careerGoals: p.careerGoals,
      religion: p.religion,
      caste: p.caste,
      subCaste: '',
      motherTongue: p.motherTongue,
      languages: p.languages,
      isManglik: p.isManglik,
      familyType: 'nuclear' as const,
      familyValues: 'moderate' as const,
      fatherOccupation: 'Executive Officer (Retd)',
      motherOccupation: 'Educator & Homemaker',
      numberOfSiblings: p.numberOfSiblings,
      siblings: p.siblings,
      childrenPreference: p.childrenPreference,
      relocationPreference: p.relocationPreference,
      petPreference: p.petPreference,
      relationshipExpectations: p.relationshipExpectations,
      diet: p.diet,
      smoking: 'no' as const,
      drinking: 'no' as const,
      hobbies: p.hobbies,
      lifestylePreferences: 'Active, balanced, social yet family-oriented',
      rashi: 'Simha',
      nakshatra: 'Rohini',
      selfDescription: `${p.relationshipExpectations} Passionate about ${p.hobbies.join(', ')}.`,
      profileCompleteness: 95,
      avatarSeed: `${p.gender}-${i}-${p.firstName.toLowerCase()}`,
      photoVisibility: 'public' as const,
      verificationStatus: 'unverified' as const, // Never genuinely verified
      journeyStatus: isClient ? 'active' as const : 'new' as const,
      preferences: partnerPreferencesPayload,
      onboardedAt: new Date(Date.now() - (i * 86400000)),
    };

    // Idempotent upsert by unique profileId
    const savedCustomer = await Customer.findOneAndUpdate(
      { profileId },
      { $set: customerDoc },
      { upsert: true, new: true, runValidators: true }
    );

    // Also store partner preferences separately in MatchPreference collection
    await MatchPreference.findOneAndUpdate(
      { candidateId: savedCustomer._id },
      {
        $set: {
          candidateId: savedCustomer._id,
          ...partnerPreferencesPayload,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    insertedCount++;
  }

  const totalCandidates = await Customer.countDocuments();
  const totalPreferences = await MatchPreference.countDocuments();

  console.log(`[Seed Result] Processed ${insertedCount} profiles. Total Customers in DB: ${totalCandidates}. Total MatchPreferences: ${totalPreferences}.`);

  return {
    insertedCount,
    totalCandidates,
    totalPreferences,
  };
}
