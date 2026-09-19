export const initialStats = {
  totalEvents: 4,
  activeTasks: 24,
  pendingTasks: 8,
  volunteers: 32,
  upcomingDeadlines: 7,
  openRisks: 3
};

export const initialDeadlines = [
  { id: 1, title: 'Confirm venue', team: 'Operations Team', due: 'Tomorrow', priority: 'High', event: 'TechNova Hackathon 2026' },
  { id: 2, title: 'Finalize sponsorship proposal', team: 'Sponsorship Team', due: '25 Sept', priority: 'High', event: 'TechNova Hackathon 2026' },
  { id: 3, title: 'Publish registration form', team: 'Web Team', due: '27 Sept', priority: 'Medium', event: 'CodeQuest 2026' },
  { id: 4, title: 'Volunteer orientation', team: 'HR Team', due: '29 Sept', priority: 'Medium', event: 'TechNova Hackathon 2026' },
];

export const taskProgress = {
  completed: 48,
  inProgress: 27,
  pending: 17,
  blocked: 8,
};

export const recentActivities = [
  { id: 1, user: 'Priya', action: 'created a new task', target: 'Volunteer schedule draft', time: '2 minutes ago' },
  { id: 2, user: 'Rohan', action: 'completed', target: '"Sponsor outreach"', time: '25 minutes ago' },
  { id: 3, user: 'Amit', action: 'uploaded', target: 'Event Guidelines.pdf', time: '1 hour ago' },
  { id: 4, user: 'Prince', action: 'created a new meeting', target: 'Weekly Core Team Meeting', time: '2 hours ago' },
];

export const aiInsights = [
  { id: 1, type: 'warning', text: '3 tasks have no assigned owner.', cta: 'Review Tasks', link: '/tasks?filter=unassigned' },
  { id: 2, type: 'urgent', text: 'Venue confirmation deadline is approaching.', cta: 'View Task', link: '/tasks' },
  { id: 3, type: 'success', text: 'Volunteer coverage is sufficient for registration.', cta: 'View Volunteers', link: '/volunteers' },
  { id: 4, type: 'warning', text: '2 high-priority tasks are overdue.', cta: 'Review Tasks', link: '/tasks?filter=overdue' },
];

export const initialEvents = [
  {
    id: 'technova-2026',
    name: 'TechNova Hackathon 2026',
    date: '15 Oct 2026',
    location: 'Main Auditorium',
    participants: 300,
    volunteers: 20,
    status: 'Planning',
    progress: 72,
    description: 'The premier 24-hour hackathon bringing together top developers, designers, and innovators to build impactful solutions.',
    category: 'Hackathon',
  },
  {
    id: 'codequest-2026',
    name: 'CodeQuest 2026',
    date: '10 Nov 2026',
    location: 'CS Department Labs',
    participants: 150,
    volunteers: 12,
    status: 'Upcoming',
    progress: 40,
    description: 'Annual algorithmic problem-solving and coding competition for competitive programmers and enthusiastic coders.',
    category: 'Competition',
  },
  {
    id: 'web-workshop',
    name: 'Web Workshop',
    date: '28 Sept 2026',
    location: 'Seminar Hall B',
    participants: 80,
    volunteers: 8,
    status: 'Completed',
    progress: 100,
    description: 'Hands-on workshop covering modern web stacks, component architecture, APIs, and scalable deployment pipelines.',
    category: 'Workshop',
  },
  {
    id: 'designathon-2026',
    name: 'Designathon 2026',
    date: '05 Dec 2026',
    location: 'Design Studio',
    participants: 120,
    volunteers: 10,
    status: 'Planning',
    progress: 15,
    description: 'UI/UX design sprint challenging student teams to create human-centered digital interfaces and product prototypes.',
    category: 'Design Sprint',
  }
];

export const initialTasks = [
  { id: 1, title: 'Confirm venue', owner: 'Rohan', priority: 'High', status: 'In Progress', deadline: '23 Sept', event: 'TechNova Hackathon 2026', description: 'Meet with facilities management to secure main auditorium and lab access.' },
  { id: 2, title: 'Prepare registration form', owner: 'Amit', priority: 'Medium', status: 'Todo', deadline: '27 Sept', event: 'TechNova Hackathon 2026', description: 'Build Google Forms and custom landing page input fields for team signups.' },
  { id: 3, title: 'Contact sponsors', owner: 'Priya', priority: 'High', status: 'Completed', deadline: '20 Sept', event: 'TechNova Hackathon 2026', description: 'Send out Tier 1 pitch decks to 15 partner companies.' },
  { id: 4, title: 'Prepare event posters', owner: 'Neha', priority: 'Medium', status: 'Todo', deadline: '28 Sept', event: 'TechNova Hackathon 2026', description: 'Design 3 variations for Instagram, campus bulletin boards, and Discord.' },
  { id: 5, title: 'Security and safety clearance', owner: 'Kavita', priority: 'Critical', status: 'Blocked', deadline: '24 Sept', event: 'TechNova Hackathon 2026', description: 'Waiting on approval signature from student affairs dean.' },
  { id: 6, title: 'Food and catering vendor setup', owner: 'Rohan', priority: 'High', status: 'In Progress', deadline: '29 Sept', event: 'TechNova Hackathon 2026', description: 'Finalize dinner and midnight snack menus for 300 hackathon attendees.' },
  { id: 7, title: 'Setup live streaming equipment', owner: 'Amit', priority: 'Low', status: 'Todo', deadline: '02 Oct', event: 'CodeQuest 2026', description: 'Check HDMI capture cards and test YouTube live stream latency.' },
  { id: 8, title: 'Volunteer briefing decks', owner: 'Priya', priority: 'Medium', status: 'Todo', deadline: '30 Sept', event: 'TechNova Hackathon 2026', description: 'Compile day-of-event guidelines and emergency protocol slides.' }
];

export const initialVolunteers = [
  {
    id: 1,
    name: 'Rohan Patel',
    role: 'Sponsorship Lead',
    skills: 'Communication, Negotiation',
    availability: 'Available',
    assignedTasks: 4,
    status: 'Active',
    email: 'rohan.p@club.edu',
    phone: '+91 98765 43210'
  },
  {
    id: 2,
    name: 'Priya Shah',
    role: 'Operations Lead',
    skills: 'Event Management, Scheduling',
    availability: 'Available',
    assignedTasks: 6,
    status: 'Active',
    email: 'priya.s@club.edu',
    phone: '+91 98765 43211'
  },
  {
    id: 3,
    name: 'Amit Kumar',
    role: 'Technical Lead',
    skills: 'React, JavaScript, DevOps',
    availability: 'Busy',
    assignedTasks: 5,
    status: 'Active',
    email: 'amit.k@club.edu',
    phone: '+91 98765 43212'
  },
  {
    id: 4,
    name: 'Neha Gupta',
    role: 'Design & Media',
    skills: 'Figma, Canva, Motion Graphics',
    availability: 'Available',
    assignedTasks: 3,
    status: 'Active',
    email: 'neha.g@club.edu',
    phone: '+91 98765 43213'
  },
  {
    id: 5,
    name: 'Kavita Sharma',
    role: 'Logistics',
    skills: 'Vendor Management, Inventory',
    availability: 'Busy',
    assignedTasks: 4,
    status: 'Active',
    email: 'kavita.s@club.edu',
    phone: '+91 98765 43214'
  },
  {
    id: 6,
    name: 'Rahul Verma',
    role: 'Outreach & PR',
    skills: 'Social Media, Content Writing',
    availability: 'Available',
    assignedTasks: 2,
    status: 'Active',
    email: 'rahul.v@club.edu',
    phone: '+91 98765 43215'
  }
];

export const initialMeetings = [
  {
    id: 1,
    title: 'Weekly Core Team Meeting',
    date: 'Today',
    time: '5:00 PM',
    participants: 8,
    agenda: 'Overall progress check, sponsorship pipeline review, and blocker resolution across departments.',
    notesStatus: 'Ready',
    actionItemCount: 4,
    notes: `Discussed venue confirmation.
Rohan will contact the sponsor by Friday.
Priya will book the auditorium.
Amit will prepare the registration form by Monday.`,
    extractedActions: [
      { task: 'Contact sponsor for tier 1 commitment', owner: 'Rohan', deadline: 'Friday' },
      { task: 'Book auditorium and sign requisition slip', owner: 'Priya', deadline: 'Tomorrow' },
      { task: 'Prepare registration form on website', owner: 'Amit', deadline: 'Monday' }
    ]
  },
  {
    id: 2,
    title: 'Venue Planning Meeting',
    date: 'Tomorrow',
    time: '4:00 PM',
    participants: 5,
    agenda: 'Review auditorium seating layout, AV equipment needs, power distribution, and backup generators.',
    notesStatus: 'Pending',
    actionItemCount: 3,
    notes: `Reviewing technical specifications with the AV team. Need to ensure 350+ sockets for laptops and 2 high-speed access points.`,
    extractedActions: [
      { task: 'Submit electrical extension board request', owner: 'Kavita', deadline: 'Wednesday' },
      { task: 'Test projector HDMI connectivity', owner: 'Amit', deadline: 'Thursday' }
    ]
  },
  {
    id: 3,
    title: 'Sponsorship Meeting',
    date: '25 Sept',
    time: '6:00 PM',
    participants: 4,
    agenda: 'Review customized sponsor tiers, merchandise allocations, and follow-up emails for tech partners.',
    notesStatus: 'Draft',
    actionItemCount: 4,
    notes: `Initial calls completed with 4 companies. Two requested customized booth space in the foyer. Need revised deck by Tuesday.`,
    extractedActions: [
      { task: 'Update sponsorship brochure with foyer booth specs', owner: 'Neha', deadline: 'Tuesday' },
      { task: 'Send follow-up emails to TechCorp and DevRel Ltd', owner: 'Rohan', deadline: 'Wednesday' }
    ]
  }
];

export const initialDocuments = [
  {
    id: 1,
    name: 'Event Guidelines.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadedBy: 'Prince',
    uploadedDate: '18 Sept 2026',
    category: 'Guidelines',
    event: 'TechNova Hackathon 2026',
  },
  {
    id: 2,
    name: 'Sponsorship Proposal.docx',
    type: 'DOCX',
    size: '1.1 MB',
    uploadedBy: 'Rohan',
    uploadedDate: '17 Sept 2026',
    category: 'Sponsorship',
    event: 'TechNova Hackathon 2026',
  },
  {
    id: 3,
    name: 'Venue Requirements.pdf',
    type: 'PDF',
    size: '850 KB',
    uploadedBy: 'Priya',
    uploadedDate: '16 Sept 2026',
    category: 'Operations',
    event: 'TechNova Hackathon 2026',
  },
  {
    id: 4,
    name: 'Budget Breakdown.xlsx',
    type: 'XLSX',
    size: '640 KB',
    uploadedBy: 'Prince',
    uploadedDate: '15 Sept 2026',
    category: 'Finance',
    event: 'TechNova Hackathon 2026',
  }
];

export const initialRisks = [
  {
    id: 1,
    risk: 'Venue confirmation delayed',
    severity: 'High',
    probability: 'Medium',
    impact: 'Event schedule disruption',
    owner: 'Rohan',
    status: 'Open',
    mitigation: "Follow up directly with Dean's office and propose backup seminar hall as contingency."
  },
  {
    id: 2,
    risk: 'Insufficient registration volunteers',
    severity: 'Medium',
    probability: 'Medium',
    impact: 'Registration delays',
    owner: 'Priya',
    status: 'Open',
    mitigation: 'Recruit 5 additional volunteers from the junior council and conduct a 15-minute briefing.'
  },
  {
    id: 3,
    risk: 'Sponsor confirmation pending',
    severity: 'High',
    probability: 'High',
    impact: 'Budget impact',
    owner: 'Amit',
    status: 'Monitoring',
    mitigation: 'Engage alumni network for emergency co-sponsorships and trim non-critical merchandise costs.'
  },
  {
    id: 4,
    risk: 'Network bandwidth bottleneck',
    severity: 'Medium',
    probability: 'High',
    impact: 'Live demo failures',
    owner: 'Amit',
    status: 'Mitigated',
    mitigation: 'Leased dedicated 1Gbps temporary LAN switch and isolated guest Wi-Fi network.'
  }
];

export const initialAnnouncements = [
  {
    id: 1,
    title: 'Volunteer Meeting Reminder',
    audience: 'Volunteers',
    date: '19 Sept 2026',
    status: 'Published',
    content: 'Reminder: Core volunteer briefing session will take place today at 5:00 PM in Seminar Hall A. Attendance is mandatory for all leads.'
  },
  {
    id: 2,
    title: 'Registration Deadline Update',
    audience: 'All Participants',
    date: '18 Sept 2026',
    status: 'Draft',
    content: 'Early bird registrations will officially close this Friday at 11:59 PM. Please make sure to submit your team rosters before slots fill up.'
  },
  {
    id: 3,
    title: 'Sponsor Onboarding Welcome',
    audience: 'External',
    date: '14 Sept 2026',
    status: 'Published',
    content: 'We are thrilled to welcome CloudScale as our Title Sponsor for TechNova Hackathon 2026! Official posters and swag teasers dropping tomorrow.'
  }
];

export const initialKnowledge = [
  {
    id: 1,
    title: 'Hackathon Event Guidelines',
    category: 'Event Guidelines',
    updated: '18 Sept 2026',
    reads: 142,
    excerpt: 'Complete operational checklist, safety protocols, volunteer allocation tables, and judging rubrics for hackathon events.'
  },
  {
    id: 2,
    title: 'Venue Booking SOP',
    category: 'SOPs',
    updated: '15 Sept 2026',
    reads: 98,
    excerpt: 'Standard operating procedure for reserving campus auditoriums, labs, faculty clearances, and electrical safety permissions.'
  },
  {
    id: 3,
    title: 'Previous Hackathon Report',
    category: 'Previous Events',
    updated: '10 Sept 2026',
    reads: 215,
    excerpt: 'Post-event retrospective, budget utilization breakdown, sponsor feedback analysis, and attendance analytics from 2025.'
  },
  {
    id: 4,
    title: 'Sponsor Outreach Playbook',
    category: 'Sponsors',
    updated: '04 Sept 2026',
    reads: 120,
    excerpt: 'Email templates, pitch deck slide guides, tiered sponsorship perks, and follow-up timelines for securing tech sponsorships.'
  },
  {
    id: 5,
    title: 'Campus Security & Permissions',
    category: 'Club Policies',
    updated: '28 Aug 2026',
    reads: 84,
    excerpt: 'Overnight event protocols, student gate passes, security guard rosters, and emergency medical contact directories.'
  },
  {
    id: 6,
    title: 'AV & Networking Checklist',
    category: 'Venues',
    updated: '20 Aug 2026',
    reads: 67,
    excerpt: 'Hardware setup guide for dual projectors, wireless microphones, soundboard mixing, and dedicated hackathon Wi-Fi SSIDs.'
  }
];

export const initialSettings = {
  clubName: 'TechNova Club',
  clubDescription: 'Technology and Innovation Club of engineering students driving hackathons, workshops, and open-source initiatives.',
  userName: 'Prince',
  userRole: 'Admin',
  userEmail: 'prince@example.com',
  preferences: {
    emailNotifications: true,
    taskReminders: true,
    riskAlerts: true
  }
};
