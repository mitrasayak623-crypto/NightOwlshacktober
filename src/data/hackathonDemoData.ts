/**
 * Fictional Sample Dataset: "Hackathon Team"
 * Strictly complies with Section 18 (Demo Mode) and Section 6
 * Fully consistent internally, verified evidence references.
 */

import { Chat, Message, Task, Decision, OpenQuestion, PlanChange, Summary, TopicCluster, RepeatedQuestion } from '../types';

export const DEMO_CHAT_ID = 'chat_hackathon_demo_01';

export const DEMO_CHAT: Chat = {
  id: DEMO_CHAT_ID,
  displayName: 'Hackathon Team',
  importedAt: '2026-10-19T07:30:00.000Z',
  sourceFormat: 'fictional_demo',
  messageCount: 16,
  dateRange: {
    start: 'Oct 19, 2026, 08:30 PM',
    end: 'Oct 20, 2026, 02:15 AM',
  },
  processingMode: 'demo_mode',
  isSampleData: true,
};

export const DEMO_MESSAGES: Message[] = [
  {
    id: 'msg_01',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 8:30 PM',
    sender: 'Alex Rivera',
    text: 'Hey team, quick sync before tomorrow morning! How is everyone looking on their deliverables?',
    messageType: 'user',
    sourceLineReference: 1,
  },
  {
    id: 'msg_02',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 8:32 PM',
    sender: 'Elena Rostova',
    text: 'UI wireframes and live demo flow are ready. I will finish the presentation pitch deck slides by tonight 11:00 PM so we can rehearse.',
    messageType: 'user',
    sourceLineReference: 2,
  },
  {
    id: 'msg_03',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 8:35 PM',
    sender: 'David Chen',
    text: 'Awesome Elena. For the backend database, let us use Firebase Firestore for quick realtime sync.',
    messageType: 'user',
    sourceLineReference: 3,
  },
  {
    id: 'msg_04',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 8:40 PM',
    sender: 'Marcus Brody',
    text: 'Sounds good. What time should we meet tomorrow morning in person? 9 AM or 10 AM?',
    messageType: 'user',
    sourceLineReference: 4,
  },
  {
    id: 'msg_05',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 8:44 PM',
    sender: 'Alex Rivera',
    text: 'Let us meet tomorrow at 10:00 AM sharp in Innovation Lab A. Gives everyone sleep.',
    messageType: 'user',
    sourceLineReference: 5,
  },
  {
    id: 'msg_06',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 8:45 PM',
    sender: 'Elena Rostova',
    text: '10:00 AM in Lab A works great for me.',
    messageType: 'user',
    sourceLineReference: 6,
  },
  {
    id: 'msg_07',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 8:46 PM',
    sender: 'David Chen',
    text: 'Confirmed, 10:00 AM Lab A.',
    messageType: 'user',
    sourceLineReference: 7,
  },
  {
    id: 'msg_08',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 9:15 PM',
    sender: 'Marcus Brody',
    text: 'Question: Did anyone check if we need to bring our own HDMI adapters for the demo booth projectors, or does the venue provide them?',
    messageType: 'user',
    sourceLineReference: 8,
  },
  {
    id: 'msg_09',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 10:55 PM',
    sender: 'Elena Rostova',
    text: 'Pitch deck slides are finished and uploaded to our shared drive right on time!',
    messageType: 'user',
    sourceLineReference: 9,
  },
  {
    id: 'msg_10',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 11:20 PM',
    sender: 'Liam O’Connor',
    text: 'Wait David, check rule 4 in the hackathon judging rubric: backend must support relational SQL queries for the analytical benchmark.',
    messageType: 'user',
    sourceLineReference: 10,
  },
  {
    id: 'msg_11',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 11:24 PM',
    sender: 'Liam O’Connor',
    text: 'We cannot use Firebase NoSQL. We need to switch to PostgreSQL with Supabase instead.',
    messageType: 'user',
    sourceLineReference: 11,
  },
  {
    id: 'msg_12',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 11:42 PM',
    sender: 'David Chen',
    text: 'Crucial catch Liam! You are 100% right. Changing plan: switching backend from Firebase to PostgreSQL on Supabase now.',
    messageType: 'user',
    sourceLineReference: 12,
  },
  {
    id: 'msg_13',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 19, 2026 11:45 PM',
    sender: 'David Chen',
    text: 'I will migrate the database schema and seed the test records before going to sleep.',
    messageType: 'user',
    sourceLineReference: 13,
  },
  {
    id: 'msg_14',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 20, 2026 1:10 AM',
    sender: 'David Chen',
    text: 'PostgreSQL schema deployed and test queries pass with flying colors.',
    messageType: 'user',
    sourceLineReference: 14,
  },
  {
    id: 'msg_15',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 20, 2026 1:30 AM',
    sender: 'Alex Rivera',
    text: 'What time are we meeting again tomorrow morning? Just double checking.',
    messageType: 'user',
    sourceLineReference: 15,
  },
  {
    id: 'msg_16',
    chatId: DEMO_CHAT_ID,
    timestamp: 'Oct 20, 2026 2:15 AM',
    sender: 'Liam O’Connor',
    text: '10:00 AM at Innovation Lab A! Get some rest everyone.',
    messageType: 'user',
    sourceLineReference: 16,
  },
];

export const DEMO_SUMMARY: Summary = {
  id: 'sum_hackathon_01',
  chatId: DEMO_CHAT_ID,
  dateRange: {
    start: 'Oct 19, 8:30 PM',
    end: 'Oct 20, 2:15 AM',
  },
  twoLineSummary:
    'The team confirmed their in-person meeting for tomorrow at 10:00 AM in Innovation Lab A. Backend architecture was switched from Firebase to PostgreSQL to satisfy judge rubrics, and Elena completed the pitch deck.',
  keyUpdates: [
    {
      id: 'upd_01',
      text: 'Final meeting locked for 10:00 AM tomorrow in Innovation Lab A.',
      category: 'critical',
      evidenceMessageIds: ['msg_05', 'msg_07', 'msg_16'],
    },
    {
      id: 'upd_02',
      text: 'Backend database migrated to PostgreSQL after Liam spotted the rubric requirement.',
      category: 'action',
      evidenceMessageIds: ['msg_10', 'msg_11', 'msg_12', 'msg_14'],
    },
    {
      id: 'upd_03',
      text: 'Pitch deck slides finalized and uploaded to shared drive by Elena.',
      category: 'update',
      evidenceMessageIds: ['msg_02', 'msg_09'],
    },
  ],
  generatedAt: '2026-10-20T07:00:00.000Z',
  evidenceMessageIds: ['msg_02', 'msg_05', 'msg_09', 'msg_12', 'msg_14'],
};

export const DEMO_TASKS: Task[] = [
  {
    id: 'task_01',
    chatId: DEMO_CHAT_ID,
    title: 'Finish presentation pitch deck slides',
    owner: 'Elena Rostova',
    deadline: 'Oct 19, 11:00 PM',
    status: 'completed',
    priority: 'high',
    evidenceMessageIds: ['msg_02', 'msg_09'],
    confidence: 1.0,
    classification: 'explicit_commitment',
    notes: 'Completed at 10:55 PM and uploaded to shared drive.',
  },
  {
    id: 'task_02',
    chatId: DEMO_CHAT_ID,
    title: 'Migrate database schema & seed test data on PostgreSQL',
    owner: 'David Chen',
    deadline: 'Before morning rehearsal',
    status: 'completed',
    priority: 'high',
    evidenceMessageIds: ['msg_12', 'msg_13', 'msg_14'],
    confidence: 0.95,
    classification: 'explicit_commitment',
    notes: 'Deployed at 1:10 AM with verified query tests.',
  },
  {
    id: 'task_03',
    chatId: DEMO_CHAT_ID,
    title: 'Check venue projector requirements & HDMI adapters',
    owner: undefined, // No owner assigned
    deadline: undefined, // No deadline stated
    status: 'open',
    priority: 'medium',
    evidenceMessageIds: ['msg_08'],
    confidence: 0.85,
    classification: 'suggested_followup',
    notes: 'Marcus asked in chat; no team member has confirmed or taken ownership.',
  },
  {
    id: 'task_04',
    chatId: DEMO_CHAT_ID,
    title: 'Arrive at Innovation Lab A for team dry-run',
    owner: 'All Team Members',
    deadline: 'Oct 20, 10:00 AM',
    status: 'open',
    priority: 'high',
    evidenceMessageIds: ['msg_05', 'msg_07', 'msg_16'],
    confidence: 1.0,
    classification: 'explicit_commitment',
    notes: 'Confirmed location: Innovation Lab A.',
  },
];

export const DEMO_DECISIONS: Decision[] = [
  {
    id: 'dec_01',
    chatId: DEMO_CHAT_ID,
    title: 'Use Firebase Firestore for backend data storage',
    status: 'superseded',
    timestamp: 'Oct 19, 8:35 PM',
    evidenceMessageIds: ['msg_03'],
    supersedesDecisionId: undefined,
    decidedBy: 'David Chen',
    rationale: 'Initial proposal for quick realtime sync.',
  },
  {
    id: 'dec_02',
    chatId: DEMO_CHAT_ID,
    title: 'Switch backend database to PostgreSQL on Supabase',
    status: 'confirmed',
    timestamp: 'Oct 19, 11:42 PM',
    evidenceMessageIds: ['msg_10', 'msg_11', 'msg_12'],
    supersedesDecisionId: 'dec_01',
    decidedBy: 'Liam O’Connor & David Chen',
    rationale: 'Strict compliance with Rule 4 of the hackathon judging rubric.',
  },
  {
    id: 'dec_03',
    chatId: DEMO_CHAT_ID,
    title: 'Set team in-person sync for 10:00 AM at Innovation Lab A',
    status: 'confirmed',
    timestamp: 'Oct 19, 8:44 PM',
    evidenceMessageIds: ['msg_05', 'msg_07', 'msg_16'],
    supersedesDecisionId: undefined,
    decidedBy: 'Alex Rivera (agreed by all)',
    rationale: 'Allows proper rest before morning rehearsals.',
  },
];

export const DEMO_QUESTIONS: OpenQuestion[] = [
  {
    id: 'q_01',
    chatId: DEMO_CHAT_ID,
    question: 'Did anyone check if we need to bring our own HDMI adapters for the demo booth projectors?',
    askedBy: 'Marcus Brody',
    timestamp: 'Oct 19, 9:15 PM',
    evidenceMessageIds: ['msg_08'],
    status: 'unanswered',
    confidence: 0.98,
    apparentContext: 'No team member replied to this question before conversation switched to backend changes.',
  },
];

export const DEMO_PLAN_CHANGES: PlanChange[] = [
  {
    id: 'pc_01',
    chatId: DEMO_CHAT_ID,
    topic: 'Backend Architecture & Database Selection',
    earlierStatement: 'For the backend database, let us use Firebase Firestore for quick realtime sync.',
    earlierSender: 'David Chen',
    earlierTimestamp: 'Oct 19, 8:35 PM',
    laterStatement: 'We cannot use Firebase NoSQL. Changing plan: switching backend from Firebase to PostgreSQL on Supabase now.',
    laterSender: 'Liam O’Connor & David Chen',
    laterTimestamp: 'Oct 19, 11:42 PM',
    evidenceMessageIds: ['msg_03', 'msg_10', 'msg_11', 'msg_12'],
    confidence: 0.99,
  },
];

export const DEMO_TOPIC_CLUSTERS: TopicCluster[] = [
  {
    id: 'topic_01',
    title: 'Meeting Schedule & Logistics',
    messageCount: 6,
    keyParticipants: ['Alex Rivera', 'Elena Rostova', 'David Chen', 'Liam O’Connor'],
    summary: 'Agreed on 10:00 AM sharp meeting time in Innovation Lab A.',
    messageIds: ['msg_04', 'msg_05', 'msg_06', 'msg_07', 'msg_15', 'msg_16'],
  },
  {
    id: 'topic_02',
    title: 'Database Architecture & Rubric Alignment',
    messageCount: 5,
    keyParticipants: ['David Chen', 'Liam O’Connor'],
    summary: 'Discovery of Rule 4 relational rubric requirement and migration to PostgreSQL.',
    messageIds: ['msg_03', 'msg_10', 'msg_11', 'msg_12', 'msg_14'],
  },
  {
    id: 'topic_03',
    title: 'Presentation & Pitch Deck',
    messageCount: 2,
    keyParticipants: ['Elena Rostova'],
    summary: 'Slides committed and completed before 11:00 PM deadline.',
    messageIds: ['msg_02', 'msg_09'],
  },
  {
    id: 'topic_04',
    title: 'Hardware & Demo Booth Logistics',
    messageCount: 1,
    keyParticipants: ['Marcus Brody'],
    summary: 'Unanswered inquiry regarding HDMI adapter provision.',
    messageIds: ['msg_08'],
  },
];

export const DEMO_REPEATED_QUESTIONS: RepeatedQuestion[] = [
  {
    id: 'rep_01',
    normalizedQuestion: 'What time is the team meeting tomorrow?',
    occurrences: [
      {
        askedBy: 'Marcus Brody',
        timestamp: 'Oct 19, 8:40 PM',
        messageId: 'msg_04',
      },
      {
        askedBy: 'Alex Rivera',
        timestamp: 'Oct 20, 1:30 AM',
        messageId: 'msg_15',
      },
    ],
  },
];

export const SAMPLE_WHATSAPP_TEXT = `[10/19/26, 8:30:12 PM] Alex Rivera: Hey team, quick sync before tomorrow morning! How is everyone looking on their deliverables?
[10/19/26, 8:32:05 PM] Elena Rostova: UI wireframes and live demo flow are ready. I will finish the presentation pitch deck slides by tonight 11:00 PM so we can rehearse.
[10/19/26, 8:35:40 PM] David Chen: Awesome Elena. For the backend database, let us use Firebase Firestore for quick realtime sync.
[10/19/26, 8:40:18 PM] Marcus Brody: Sounds good. What time should we meet tomorrow morning in person? 9 AM or 10 AM?
[10/19/26, 8:44:22 PM] Alex Rivera: Let us meet tomorrow at 10:00 AM sharp in Innovation Lab A. Gives everyone sleep.
[10/19/26, 8:45:10 PM] Elena Rostova: 10:00 AM in Lab A works great for me.
[10/19/26, 8:46:02 PM] David Chen: Confirmed, 10:00 AM Lab A.
[10/19/26, 9:15:30 PM] Marcus Brody: Question: Did anyone check if we need to bring our own HDMI adapters for the demo booth projectors, or does the venue provide them?
[10/19/26, 10:55:18 PM] Elena Rostova: Pitch deck slides are finished and uploaded to our shared drive right on time!
[10/19/26, 11:20:44 PM] Liam O’Connor: Wait David, check rule 4 in the hackathon judging rubric: backend must support relational SQL queries for the analytical benchmark.
[10/19/26, 11:24:02 PM] Liam O’Connor: We cannot use Firebase NoSQL. We need to switch to PostgreSQL with Supabase instead.
[10/19/26, 11:42:15 PM] David Chen: Crucial catch Liam! You are 100% right. Changing plan: switching backend from Firebase to PostgreSQL on Supabase now.
[10/19/26, 11:45:00 PM] David Chen: I will migrate the database schema and seed the test records before going to sleep.
[10/20/26, 1:10:35 AM] David Chen: PostgreSQL schema deployed and test queries pass with flying colors.
[10/20/26, 1:30:12 AM] Alex Rivera: What time are we meeting again tomorrow morning? Just double checking.
[10/20/26, 2:15:08 AM] Liam O’Connor: 10:00 AM at Innovation Lab A! Get some rest everyone.`;

export const SAMPLE_JSON_TEXT = JSON.stringify(
  {
    chatName: "Weekend Trip Planning",
    messages: [
      {
        timestamp: "2026-10-18 14:00",
        sender: "Chloe",
        text: "Are we still doing Lake Tahoe next Saturday?"
      },
      {
        timestamp: "2026-10-18 14:05",
        sender: "Sam",
        text: "Yes! I will book the cabin rental tonight by 8 PM."
      },
      {
        timestamp: "2026-10-18 14:12",
        sender: "Maya",
        text: "Awesome. Did anyone check if chains are required for the tires?"
      },
      {
        timestamp: "2026-10-18 16:30",
        sender: "Sam",
        text: "Cabin is confirmed and deposit paid."
      }
    ]
  },
  null,
  2
);
