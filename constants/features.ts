export const FEATURES = [
  {
    id: 'approvals',
    name: 'Approval Queue',
    desc: 'Verify new members',
    icon: 'shield-checkmark',
    route: '/(admin)/approvals',
    premium: false,
    color: '#21307A'
  },
  {
    id: 'finance',
    name: 'Finance Tracker',
    desc: 'Ledgers & Collections',
    icon: 'wallet-outline',
    route: '/(admin)/finance',
    premium: false, // 🌟 Premium Feature
    color: '#059669'
  },
  {
    id: 'syllabus',
    name: 'Syllabus Mgt.',
    desc: 'Pathshala & Lessons',
    icon: 'book-outline',
    route: '/(admin)/syllabus',
    premium: true,
    color: '#7C3AED'
  },
  {
    id: 'events',
    name: 'Event Manager',
    desc: 'RSVPs & Scheduling',
    icon: 'calendar-outline',
    route: '/(admin)/events',
    premium: false,
    color: '#EA580C'
  }
];