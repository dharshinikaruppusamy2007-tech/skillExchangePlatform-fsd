require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Skill = require('../models/Skill');
const SkillRequest = require('../models/SkillRequest');
const Session = require('../models/Session');
const Review = require('../models/Review');
const Message = require('../models/Message');

// Every demo account shares this password (bcrypt hashed before storage).
const DEMO_PASSWORD = 'demo1234';

// A date `days` days from now (used for upcoming sessions).
const daysFromNow = (days, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

// A date roughly `days` days in the past (used for past sessions/reviews).
const daysAgo = (days, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

// A date a few months in the past (spreads the "members per month" chart).
const monthsAgo = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setDate(5);
  date.setHours(10, 30, 0, 0);
  return date;
};

const DEMO_USERS = [
  {
    name: 'Arun Kumar',
    email: 'arun.demo@example.com',
    role: 'user',
    location: 'Chennai',
    bio: 'Full-stack developer interested in sharing web development skills.',
    experienceLevel: 'Intermediate',
    skillsToTeach: ['Java', 'React', 'Node.js'],
    skillsToLearn: ['Python', 'Machine Learning'],
    createdAt: monthsAgo(5),
  },
  {
    name: 'Priya Sharma',
    email: 'priya.demo@example.com',
    role: 'user',
    location: 'Coimbatore',
    bio: 'Python enthusiast who enjoys learning and teaching programming.',
    experienceLevel: 'Intermediate',
    skillsToTeach: ['Python', 'Data Analysis'],
    skillsToLearn: ['React', 'UI/UX Design'],
    createdAt: monthsAgo(4),
  },
  {
    name: 'Karthik Raj',
    email: 'karthik.demo@example.com',
    role: 'user',
    location: 'Bangalore',
    bio: 'Frontend developer interested in modern web technologies.',
    experienceLevel: 'Advanced',
    skillsToTeach: ['React', 'JavaScript', 'Tailwind CSS'],
    skillsToLearn: ['Node.js', 'MongoDB'],
    createdAt: monthsAgo(3),
  },
  {
    name: 'Meena Devi',
    email: 'meena.demo@example.com',
    role: 'user',
    location: 'Madurai',
    bio: 'UI/UX learner interested in building clean and accessible interfaces.',
    experienceLevel: 'Beginner',
    skillsToTeach: ['Figma', 'UI Design'],
    skillsToLearn: ['React', 'JavaScript'],
    createdAt: monthsAgo(2),
  },
  {
    name: 'Rahul Kumar',
    email: 'rahul.demo@example.com',
    role: 'user',
    location: 'Trichy',
    bio: 'Backend developer interested in APIs and databases.',
    experienceLevel: 'Intermediate',
    skillsToTeach: ['Node.js', 'MongoDB', 'Express.js'],
    skillsToLearn: ['React', 'Docker'],
    createdAt: monthsAgo(1),
  },
  {
    name: 'Ananya S',
    email: 'ananya.demo@example.com',
    role: 'user',
    location: 'Salem',
    bio: 'Computer science student exploring data science and web development.',
    experienceLevel: 'Beginner',
    skillsToTeach: ['Python', 'SQL'],
    skillsToLearn: ['Machine Learning', 'React'],
    createdAt: daysAgo(25, 12),
  },
  {
    name: 'Skill Exchange Admin',
    email: 'admin.demo@example.com',
    role: 'admin',
    location: '',
    bio: 'Platform administrator for the Skill Exchange demo.',
    experienceLevel: 'Advanced',
    skillsToTeach: [],
    skillsToLearn: [],
    createdAt: monthsAgo(6),
  },
];

// `skillName` should match what the Discover filters expect by category.
const DEMO_SKILLS = [
  // Arun Kumar
  { email: 'arun.demo@example.com', skillName: 'Java Programming', category: 'Programming', type: 'teach', proficiency: 'Intermediate', description: 'Core Java, OOP principles and building console applications.' },
  { email: 'arun.demo@example.com', skillName: 'React Development', category: 'Web Development', type: 'teach', proficiency: 'Advanced', description: 'Modern React with hooks, context API and component-driven UI development.' },
  { email: 'arun.demo@example.com', skillName: 'Node.js Backend Development', category: 'Programming', type: 'teach', proficiency: 'Intermediate', description: 'REST APIs and server-side JavaScript with Express and Node.js.' },
  { email: 'arun.demo@example.com', skillName: 'Python Programming', category: 'Programming', type: 'learn', proficiency: 'Beginner', description: 'Switching to Python for scripting and automation.' },
  { email: 'arun.demo@example.com', skillName: 'Machine Learning Basics', category: 'Data Science', type: 'learn', proficiency: 'Beginner', description: 'Curious about ML concepts, scikit-learn and model evaluation.' },

  // Priya Sharma
  { email: 'priya.demo@example.com', skillName: 'Python Programming', category: 'Programming', type: 'teach', proficiency: 'Intermediate', description: 'Python fundamentals, automation and clean scripting.' },
  { email: 'priya.demo@example.com', skillName: 'Data Analysis', category: 'Data Science', type: 'teach', proficiency: 'Intermediate', description: 'Pandas, NumPy and data visualization workflows.' },
  { email: 'priya.demo@example.com', skillName: 'React Development', category: 'Web Development', type: 'learn', proficiency: 'Advanced', description: 'Learning React to build interactive data dashboards.' },
  { email: 'priya.demo@example.com', skillName: 'UI/UX Design', category: 'Design', type: 'learn', proficiency: 'Beginner', description: 'Improving design sense for data-heavy interfaces.' },

  // Karthik Raj
  { email: 'karthik.demo@example.com', skillName: 'React Development', category: 'Web Development', type: 'teach', proficiency: 'Advanced', description: 'Advanced React patterns, state management and performance.' },
  { email: 'karthik.demo@example.com', skillName: 'JavaScript', category: 'Programming', type: 'teach', proficiency: 'Advanced', description: 'Modern ES2020+, async patterns and browser APIs.' },
  { email: 'karthik.demo@example.com', skillName: 'Tailwind CSS', category: 'Web Development', type: 'teach', proficiency: 'Intermediate', description: 'Utility-first CSS and responsive design with Tailwind.' },
  { email: 'karthik.demo@example.com', skillName: 'Node.js Backend Development', category: 'Programming', type: 'learn', proficiency: 'Intermediate', description: 'Learning Node.js to build full-stack applications.' },
  { email: 'karthik.demo@example.com', skillName: 'MongoDB Database', category: 'Programming', type: 'learn', proficiency: 'Beginner', description: 'Document modeling and aggregation with MongoDB.' },

  // Meena Devi
  { email: 'meena.demo@example.com', skillName: 'Figma Design', category: 'Design', type: 'teach', proficiency: 'Beginner', description: 'Wireframing and UI prototypes with Figma.' },
  { email: 'meena.demo@example.com', skillName: 'UI/UX Design', category: 'Design', type: 'teach', proficiency: 'Beginner', description: 'Design fundamentals, color and accessibility basics.' },
  { email: 'meena.demo@example.com', skillName: 'React Development', category: 'Web Development', type: 'learn', proficiency: 'Advanced', description: 'Learning React to bring her designs to life.' },
  { email: 'meena.demo@example.com', skillName: 'JavaScript', category: 'Programming', type: 'learn', proficiency: 'Advanced', description: 'Building interactive UI logic with vanilla JavaScript.' },

  // Rahul Kumar
  { email: 'rahul.demo@example.com', skillName: 'Node.js Backend Development', category: 'Programming', type: 'teach', proficiency: 'Intermediate', description: 'Express servers, middleware and REST API design.' },
  { email: 'rahul.demo@example.com', skillName: 'MongoDB Database', category: 'Programming', type: 'teach', proficiency: 'Intermediate', description: 'MongoDB schema design and aggregation pipelines.' },
  { email: 'rahul.demo@example.com', skillName: 'Express.js API Development', category: 'Programming', type: 'teach', proficiency: 'Intermediate', description: 'Building and securing REST APIs with Express.' },
  { email: 'rahul.demo@example.com', skillName: 'React Development', category: 'Web Development', type: 'learn', proficiency: 'Advanced', description: 'Learning React so I can ship complete features end to end.' },
  { email: 'rahul.demo@example.com', skillName: 'Docker', category: 'Programming', type: 'learn', proficiency: 'Beginner', description: 'Containerizing backend services and learning Docker Compose.' },

  // Ananya S
  { email: 'ananya.demo@example.com', skillName: 'Python Programming', category: 'Programming', type: 'teach', proficiency: 'Intermediate', description: 'Python basics, functions and problem solving.' },
  { email: 'ananya.demo@example.com', skillName: 'SQL', category: 'Programming', type: 'teach', proficiency: 'Intermediate', description: 'SQL queries, joins and basic database design.' },
  { email: 'ananya.demo@example.com', skillName: 'Machine Learning Basics', category: 'Data Science', type: 'learn', proficiency: 'Beginner', description: 'Starting with ML fundamentals and tools.' },
  { email: 'ananya.demo@example.com', skillName: 'React Development', category: 'Web Development', type: 'learn', proficiency: 'Advanced', description: 'Learning React for my college projects.' },
];

// Requests reference demo users by email and demo skills by owner email + name.
const DEMO_REQUESTS = [
  { senderEmail: 'priya.demo@example.com', receiverEmail: 'arun.demo@example.com', requestedSkill: 'Java Programming', offeredSkill: 'Python Programming', status: 'accepted', message: 'I would love to learn Java. I can help you with Python in return!' },
  { senderEmail: 'karthik.demo@example.com', receiverEmail: 'rahul.demo@example.com', requestedSkill: 'Node.js Backend Development', offeredSkill: 'React Development', status: 'accepted', message: 'I want to strengthen my backend skills. Happy to trade React knowledge!' },
  { senderEmail: 'meena.demo@example.com', receiverEmail: 'karthik.demo@example.com', requestedSkill: 'React Development', offeredSkill: 'Figma Design', status: 'accepted', message: 'I would love to learn React from you. I can help you design your interfaces!' },
  { senderEmail: 'ananya.demo@example.com', receiverEmail: 'priya.demo@example.com', requestedSkill: 'Python Programming', offeredSkill: 'SQL', status: 'accepted', message: 'I am learning Python basics and would appreciate a more experienced mentor.' },
  { senderEmail: 'karthik.demo@example.com', receiverEmail: 'meena.demo@example.com', requestedSkill: 'Figma Design', offeredSkill: 'React Development', status: 'accepted', message: 'I want to improve my design workflow. I can teach you React in exchange.' },
  { senderEmail: 'rahul.demo@example.com', receiverEmail: 'karthik.demo@example.com', requestedSkill: 'React Development', offeredSkill: 'Express.js API Development', status: 'accepted', message: 'I am moving to the frontend and need help with React. I can cover Express in return.' },
  { senderEmail: 'ananya.demo@example.com', receiverEmail: 'priya.demo@example.com', requestedSkill: 'Data Analysis', offeredSkill: 'Python Programming', status: 'pending', message: 'Could you teach me data analysis with Python? I can help you practice basic Python too.' },
  { senderEmail: 'priya.demo@example.com', receiverEmail: 'meena.demo@example.com', requestedSkill: 'UI/UX Design', offeredSkill: 'Python Programming', status: 'rejected', message: 'I want to improve the UX of my data dashboards.' },
  { senderEmail: 'meena.demo@example.com', receiverEmail: 'rahul.demo@example.com', requestedSkill: 'Node.js Backend Development', offeredSkill: 'UI/UX Design', status: 'cancelled', message: 'I wanted to try backend basics, but my schedule changed.' },
];

// Each session references the accepted request that produced it. Mentor is the
// owner of the requested skill (the receiver), learner is the sender.
const DEMO_SESSIONS = [
  { senderEmail: 'priya.demo@example.com', receiverEmail: 'arun.demo@example.com', requestedSkill: 'Java Programming', scheduledDate: daysFromNow(4, 10), startTime: '10:00', duration: 60, meetingMode: 'Online', meetingLink: 'https://meet.google.com/demo-java', notes: 'Bring your laptop. We will start with variables, loops and OOP basics.', status: 'Upcoming' },
  { senderEmail: 'meena.demo@example.com', receiverEmail: 'karthik.demo@example.com', requestedSkill: 'React Development', scheduledDate: daysAgo(14, 15), startTime: '15:00', duration: 60, meetingMode: 'Online', meetingLink: 'https://meet.google.com/demo-react', notes: 'We covered components, props and the useState hook.', status: 'Completed' },
  { senderEmail: 'karthik.demo@example.com', receiverEmail: 'rahul.demo@example.com', requestedSkill: 'Node.js Backend Development', scheduledDate: daysFromNow(7, 17), startTime: '17:00', duration: 45, meetingMode: 'Online', meetingLink: 'https://meet.google.com/demo-node', notes: 'We will build our first Express API together.', status: 'Upcoming' },
  { senderEmail: 'ananya.demo@example.com', receiverEmail: 'priya.demo@example.com', requestedSkill: 'Python Programming', scheduledDate: daysAgo(21, 11), startTime: '11:00', duration: 45, meetingMode: 'Online', meetingLink: 'https://meet.google.com/demo-python', notes: 'Practiced functions, lists and basic file handling.', status: 'Completed' },
  { senderEmail: 'karthik.demo@example.com', receiverEmail: 'meena.demo@example.com', requestedSkill: 'Figma Design', scheduledDate: daysAgo(6, 16), startTime: '16:00', duration: 60, meetingMode: 'Online', meetingLink: 'https://meet.google.com/demo-figma', notes: 'Cancelled because I had a client deadline.', status: 'Cancelled' },
  { senderEmail: 'rahul.demo@example.com', receiverEmail: 'karthik.demo@example.com', requestedSkill: 'React Development', scheduledDate: daysAgo(28, 14), startTime: '14:00', duration: 60, meetingMode: 'Online', meetingLink: 'https://meet.google.com/demo-react2', notes: 'Completed a full React review session.', status: 'Completed' },
];

// Reviews are only defined for COMPLETED sessions; pairings match the session.
const DEMO_REVIEWS = [
  { senderEmail: 'meena.demo@example.com', receiverEmail: 'karthik.demo@example.com', requestedSkill: 'React Development', reviewerEmail: 'meena.demo@example.com', rating: 5, comment: 'Karthik explained state and hooks so clearly. Every example felt practical.' },
  { senderEmail: 'meena.demo@example.com', receiverEmail: 'karthik.demo@example.com', requestedSkill: 'React Development', reviewerEmail: 'karthik.demo@example.com', rating: 4, comment: 'Meena asked great questions and picked up components very quickly.' },
  { senderEmail: 'ananya.demo@example.com', receiverEmail: 'priya.demo@example.com', requestedSkill: 'Python Programming', reviewerEmail: 'ananya.demo@example.com', rating: 5, comment: 'Very clear explanation and helpful examples. Great learning experience.' },
  { senderEmail: 'ananya.demo@example.com', receiverEmail: 'priya.demo@example.com', requestedSkill: 'Python Programming', reviewerEmail: 'priya.demo@example.com', rating: 4, comment: 'Ananya is a motivated student who arrives prepared every session.' },
  { senderEmail: 'rahul.demo@example.com', receiverEmail: 'karthik.demo@example.com', requestedSkill: 'React Development', reviewerEmail: 'rahul.demo@example.com', rating: 5, comment: 'One of the best React sessions I have had. Clear, structured and fun.' },
  { senderEmail: 'rahul.demo@example.com', receiverEmail: 'karthik.demo@example.com', requestedSkill: 'React Development', reviewerEmail: 'karthik.demo@example.com', rating: 3, comment: 'Great session overall, but we ran out of time before finishing the project walkthrough.' },
];

// Messages belong to ACCEPTED requests so they appear in the Messages page.
// `requestKey` ties each message to the exchange request it belongs to,
// regardless of which participant sent it.
const DEMO_MESSAGES = [
  { requestKey: 'priya.demo@example.com|arun.demo@example.com|Java Programming', senderEmail: 'arun.demo@example.com', receiverEmail: 'priya.demo@example.com', message: 'Thanks for the exchange! I can start your Java classes this weekend.' },
  { requestKey: 'priya.demo@example.com|arun.demo@example.com|Java Programming', senderEmail: 'priya.demo@example.com', receiverEmail: 'arun.demo@example.com', message: 'That works for me. I will share some Python material with you as well.' },
  { requestKey: 'karthik.demo@example.com|rahul.demo@example.com|Node.js Backend Development', senderEmail: 'karthik.demo@example.com', receiverEmail: 'rahul.demo@example.com', message: 'I really want to level up my Node.js skills. Can we start next week?' },
  { requestKey: 'karthik.demo@example.com|rahul.demo@example.com|Node.js Backend Development', senderEmail: 'rahul.demo@example.com', receiverEmail: 'karthik.demo@example.com', message: 'Sure! I will send over a schedule and we can plan the first API together.' },
  { requestKey: 'meena.demo@example.com|karthik.demo@example.com|React Development', senderEmail: 'meena.demo@example.com', receiverEmail: 'karthik.demo@example.com', message: 'I am so excited to learn React. Thank you for accepting!' },
  { requestKey: 'meena.demo@example.com|karthik.demo@example.com|React Development', senderEmail: 'karthik.demo@example.com', receiverEmail: 'meena.demo@example.com', message: 'Happy to have you! We will start with components and state.' },
  { requestKey: 'ananya.demo@example.com|priya.demo@example.com|Python Programming', senderEmail: 'ananya.demo@example.com', receiverEmail: 'priya.demo@example.com', message: 'Hi Priya, I am ready to begin the Python sessions.' },
  { requestKey: 'karthik.demo@example.com|meena.demo@example.com|Figma Design', senderEmail: 'karthik.demo@example.com', receiverEmail: 'meena.demo@example.com', message: 'Hi Meena, let me know when we can start the Figma sessions.' },
  { requestKey: 'rahul.demo@example.com|karthik.demo@example.com|React Development', senderEmail: 'rahul.demo@example.com', receiverEmail: 'karthik.demo@example.com', message: 'Thanks for the React session last month - it was really helpful!' },
];

const requestKey = (r) => `${r.senderEmail}|${r.receiverEmail}|${r.requestedSkill}`;

const summary = { users: 0, skills: 0, requests: 0, sessions: 0, reviews: 0, messages: 0 };

const createDemoUser = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) return existing;

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await User.create({ ...data, password: hashedPassword });
  summary.users += 1;
  return user;
};

const createDemoSkill = async (data, userByEmail) => {
  const user = userByEmail.get(data.email);
  if (!user) return null;

  const existing = await Skill.findOne({ userId: user._id, skillName: data.skillName, type: data.type });
  if (existing) return existing;

  const skill = await Skill.create({ userId: user._id, ...data });
  summary.skills += 1;
  return skill;
};

const createDemoRequest = async (data, userByEmail, skillByOwnerAndName) => {
  const sender = userByEmail.get(data.senderEmail);
  const receiver = userByEmail.get(data.receiverEmail);
  if (!sender || !receiver || String(sender._id) === String(receiver._id)) return null;

  const skill = skillByOwnerAndName.get(`${data.receiverEmail}::${data.requestedSkill}`);
  const offeredSkill = skillByOwnerAndName.get(`${data.senderEmail}::${data.offeredSkill}`);
  if (!skill) return null;

  const existing = await SkillRequest.findOne({ sender: sender._id, receiver: receiver._id, skill: skill._id });
  if (existing) return existing;

  const request = await SkillRequest.create({
    sender: sender._id,
    receiver: receiver._id,
    skill: skill._id,
    offeredSkill: offeredSkill ? offeredSkill._id : null,
    status: data.status,
    message: data.message || '',
  });
  summary.requests += 1;
  return request;
};

const createDemoSession = async (data, requestByKey) => {
  const request = requestByKey.get(requestKey(data));
  if (!request || request.status !== 'accepted') return null;

  const existing = await Session.findOne({ exchangeRequest: request._id });
  if (existing) return existing;

  await Session.create({
    exchangeRequest: request._id,
    mentor: request.receiver,
    learner: request.sender,
    skill: request.skill,
    scheduledDate: data.scheduledDate,
    startTime: data.startTime,
    duration: data.duration,
    meetingMode: data.meetingMode,
    meetingLink: data.meetingLink || '',
    notes: data.notes || '',
    status: data.status,
  });
  summary.sessions += 1;
  return true;
};

const createDemoReview = async (data, requestByKey, sessionByKey, userByEmail) => {
  const request = requestByKey.get(requestKey(data));
  const session = sessionByKey.get(requestKey(data));
  const reviewer = userByEmail.get(data.reviewerEmail);
  if (!request || !session || !reviewer || session.status !== 'Completed') return null;

  const isLearner = String(request.sender) === String(reviewer._id);
  const reviewee = isLearner ? request.receiver : request.sender;

  const existing = await Review.findOne({ reviewer: reviewer._id, session: session._id });
  if (existing) return existing;

  await Review.create({
    reviewer: reviewer._id,
    reviewee,
    exchangeRequest: request._id,
    session: session._id,
    skill: session.skill,
    rating: data.rating,
    comment: data.comment || '',
  });
  summary.reviews += 1;
  return true;
};

const createDemoMessage = async (data, requestByKey, userByEmail) => {
  const request = requestByKey.get(data.requestKey);
  const sender = userByEmail.get(data.senderEmail);
  const receiver = userByEmail.get(data.receiverEmail);
  if (!request || request.status !== 'accepted' || !sender || !receiver) return null;

  const existing = await Message.findOne({
    sender: sender._id,
    receiver: receiver._id,
    request: request._id,
    message: data.message,
  });
  if (existing) return existing;

  await Message.create({
    sender: sender._id,
    receiver: receiver._id,
    request: request._id,
    message: data.message,
  });
  summary.messages += 1;
  return true;
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB. Seeding demo data...\n');

    // A snapshot of pre-existing real records so we never touch them.
    const existingCounts = {
      users: await User.countDocuments({}),
      skills: await Skill.countDocuments({}),
      requests: await SkillRequest.countDocuments({}),
      sessions: await Session.countDocuments({}),
      reviews: await Review.countDocuments({}),
      messages: await Message.countDocuments({}),
    };

    const userByEmail = new Map();
    for (const data of DEMO_USERS) {
      const user = await createDemoUser(data);
      userByEmail.set(user.email, user);
    }

    const skillByOwnerAndName = new Map();
    for (const data of DEMO_SKILLS) {
      const skill = await createDemoSkill(data, userByEmail);
      if (skill) skillByOwnerAndName.set(`${data.email}::${data.skillName}`, skill);
    }

    const requestByKey = new Map();
    for (const data of DEMO_REQUESTS) {
      const request = await createDemoRequest(data, userByEmail, skillByOwnerAndName);
      if (request) requestByKey.set(requestKey(data), request);
    }

    const sessionByKey = new Map();
    for (const data of DEMO_SESSIONS) {
      await createDemoSession(data, requestByKey);
    }

    for (const data of DEMO_SESSIONS) {
      const request = requestByKey.get(requestKey(data));
      if (!request) continue;
      const session = await Session.findOne({ exchangeRequest: request._id });
      if (session) sessionByKey.set(requestKey(data), session);
    }

    for (const data of DEMO_REVIEWS) {
      await createDemoReview(data, requestByKey, sessionByKey, userByEmail);
    }

    for (const data of DEMO_MESSAGES) {
      await createDemoMessage(data, requestByKey, userByEmail);
    }

    console.log('Demo data seeded successfully.\n');
    console.log(`Users: ${summary.users}`);
    console.log(`Skills: ${summary.skills}`);
    console.log(`Exchange Requests: ${summary.requests}`);
    console.log(`Sessions: ${summary.sessions}`);
    console.log(`Reviews: ${summary.reviews}`);
    console.log(`Messages: ${summary.messages}`);
    console.log('\nExisting records preserved (pre-seed snapshot):');
    for (const [key, value] of Object.entries(existingCounts)) {
      console.log(`  ${key}: ${value}`);
    }
    console.log('\nDemo login (password for all demo accounts):');
    console.log(`  User : arun.demo@example.com  / ${DEMO_PASSWORD}`);
    console.log(`  Admin: admin.demo@example.com / ${DEMO_PASSWORD}`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
  }
};

run();