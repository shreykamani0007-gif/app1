import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Task from '../models/Task.js';
import Meeting from '../models/Meeting.js';
import Volunteer from '../models/Volunteer.js';
import Document from '../models/Document.js';
import Risk from '../models/Risk.js';
import Announcement from '../models/Announcement.js';

export const seedInitialData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;

    const eventCount = await Event.countDocuments();
    if (eventCount > 0) return; // Already seeded

    console.log('[MongoDB Seed] Empty database detected. Seeding initial event data...');

    // 1. Create Events
    const innovatex = await Event.create({
      name: 'InnovateX Fest 2026',
      description: '36-hour national collegiate hackathon, keynote speaker tracks, and tech club project exhibitions.',
      date: new Date('2026-10-12T09:00:00.000Z'),
      startDate: new Date('2026-10-12T09:00:00.000Z'),
      location: 'University Student Center & Main Audi',
      venue: 'University Student Center & Main Audi',
      status: 'Ongoing',
      expectedAttendees: 300,
    });

    const techfest = await Event.create({
      name: 'TechFest 2026',
      description: 'Annual inter-college robotics championship, paper presentations, and coding league.',
      date: new Date('2026-11-05T10:00:00.000Z'),
      startDate: new Date('2026-11-05T10:00:00.000Z'),
      location: 'Campus Engineering Block & Quad',
      venue: 'Campus Engineering Block & Quad',
      status: 'Planning',
      expectedAttendees: 450,
    });

    // 2. Create Tasks for InnovateX
    await Task.create([
      {
        eventId: innovatex._id,
        title: 'Confirm guest speaker travel reimbursement',
        description: 'Process flights and hotel invoices for 3 keynote speakers.',
        owner: 'David K.',
        department: 'Finance',
        priority: 'Urgent',
        status: 'In Progress',
        deadline: 'Tomorrow, 5:00 PM',
        dependencies: 'Dean Signature',
      },
      {
        eventId: innovatex._id,
        title: 'Prepare Wi-Fi credentials signage for Block C',
        description: 'Print QR code stands for participant wireless credentials.',
        owner: 'Tech Team',
        department: 'Tech Ops',
        priority: 'High',
        status: 'In Progress',
        deadline: 'Sep 22, 2:00 PM',
        dependencies: 'Network credentials from IT',
      },
      {
        eventId: innovatex._id,
        title: 'Finalize lunch coupons with university dining hall',
        description: 'Agree on meal packet count and dietary requirements.',
        owner: 'Alex C.',
        department: 'Logistics',
        priority: 'Medium',
        status: 'To Do',
        deadline: 'Sep 27, 4:00 PM',
        dependencies: 'Attendee registration list',
      },
      {
        eventId: innovatex._id,
        title: 'Collect participant waiver forms digitally',
        description: 'Send electronic consent forms to all 250 confirmed teams.',
        owner: 'Priya R.',
        department: 'Registration',
        priority: 'Medium',
        status: 'Completed',
        deadline: 'Completed',
        dependencies: 'None',
      },
    ]);

    // 3. Create Tasks for TechFest
    await Task.create([
      {
        eventId: techfest._id,
        title: 'Arrange venue and auditorium soundcheck',
        description: 'Book main hall and test wireless lapels & mixer console.',
        owner: 'Marcus L.',
        department: 'Logistics',
        priority: 'High',
        status: 'In Progress',
        deadline: 'Oct 5, 10:00 AM',
        dependencies: 'Facility Manager Permission',
      },
      {
        eventId: techfest._id,
        title: 'Contact sponsors for title sponsorship deck',
        description: 'Reach out to top tier sponsors with brochure and contract.',
        owner: 'Sophia W.',
        department: 'Sponsorship',
        priority: 'Urgent',
        status: 'To Do',
        deadline: 'Oct 8, 6:00 PM',
        dependencies: 'Club budget sheet',
      },
      {
        eventId: techfest._id,
        title: 'Prepare posters and social media banners',
        description: 'Design digital teaser assets and print A3 posters.',
        owner: 'Design Club',
        department: 'Marketing',
        priority: 'Medium',
        status: 'Completed',
        deadline: 'Oct 1, 12:00 PM',
        dependencies: 'Event logo finalization',
      },
    ]);

    // 4. Create Volunteers for InnovateX
    await Volunteer.create([
      {
        eventId: innovatex._id,
        name: 'Maya Patel',
        email: 'maya.patel@campus.edu',
        role: 'Lead Usher',
        team: 'Hospitality',
        shift: 'Morning (08:00 - 13:00)',
        status: 'confirmed',
      },
      {
        eventId: innovatex._id,
        name: 'Kavita Rao',
        email: 'kavita.rao@campus.edu',
        role: 'Stage Manager',
        team: 'A/V & Tech',
        shift: 'Full Day (09:00 - 18:00)',
        status: 'confirmed',
      },
      {
        eventId: innovatex._id,
        name: 'Rohan Sharma',
        email: 'rohan.sharma@campus.edu',
        role: 'Registration Desk',
        team: 'Logistics',
        shift: 'Opening Shift (07:30 - 12:00)',
        status: 'active',
      },
      {
        eventId: innovatex._id,
        name: 'David Kim',
        email: 'david.kim@campus.edu',
        role: 'Catering & Refreshments',
        team: 'Hospitality',
        shift: 'Lunch Service (11:30 - 15:30)',
        status: 'active',
      },
    ]);

    // 5. Create Volunteers for TechFest
    await Volunteer.create([
      {
        eventId: techfest._id,
        name: 'Alex Rivera',
        email: 'alex.rivera@campus.edu',
        role: 'Arena Safety Officer',
        team: 'Robotics Lead',
        shift: 'Morning (08:30 - 14:00)',
        status: 'confirmed',
      },
      {
        eventId: techfest._id,
        name: 'Chloe Dupont',
        email: 'chloe.dupont@campus.edu',
        role: 'Coding League Proctor',
        team: 'Academics',
        shift: 'Midday (11:00 - 16:30)',
        status: 'active',
      },
      {
        eventId: techfest._id,
        name: 'Tariq Mansoor',
        email: 'tariq.mansoor@campus.edu',
        role: 'Hardware Inspection',
        team: 'Tech Crew',
        shift: 'Opening Shift (08:00 - 12:30)',
        status: 'confirmed',
      },
    ]);

    // 6. Create Meetings
    await Meeting.create([
      {
        eventId: innovatex._id,
        title: 'Weekly Core Committee Sync',
        date: '2026-10-02',
        startTime: '05:00 PM',
        endTime: '06:00 PM',
        meetingType: 'In-person',
        location: 'Student Union Room 302',
        organizer: 'Alex Chen (Lead Coordinator)',
        participants: [
          { name: 'Maya Patel', role: 'Lead Usher', team: 'Hospitality', email: 'maya@campus.edu', status: 'Expected' },
          { name: 'Kavita Rao', role: 'Stage Manager', team: 'A/V & Tech', email: 'kavita@campus.edu', status: 'Confirmed' },
        ],
        agenda: 'Review sponsor booth arrangements and finalize volunteer shifts.',
        status: 'Scheduled',
      },
      {
        eventId: techfest._id,
        title: 'Robotics Arena & Safety Briefing',
        date: '2026-10-08',
        startTime: '11:00 AM',
        endTime: '12:30 PM',
        meetingType: 'In-person',
        location: 'Robotics Lab & Arena Zone 4',
        organizer: 'Alex Rivera',
        participants: [
          { name: 'Alex Rivera', role: 'Arena Safety Officer', team: 'Robotics Lead', email: 'alex@campus.edu', status: 'Confirmed' },
          { name: 'Tariq Mansoor', role: 'Hardware Inspection', team: 'Tech Crew', email: 'tariq@campus.edu', status: 'Expected' },
        ],
        agenda: 'Test emergency kill-switches across fighting robot cages.',
        status: 'Scheduled',
      },
    ]);

    // 7. Create Documents
    await Document.create([
      {
        eventId: innovatex._id,
        name: 'InnovateX_2026_Event_Proposal.pdf',
        title: 'InnovateX 2026 Event Proposal',
        category: 'Approvals',
        size: '2.4 MB',
        uploadedBy: 'Alex Chen',
      },
      {
        eventId: innovatex._id,
        name: 'Auditorium_A_V_Stage_Floorplan.pdf',
        title: 'Auditorium Floorplan',
        category: 'Logistics',
        size: '5.1 MB',
        uploadedBy: 'Sarah Miller',
      },
      {
        eventId: techfest._id,
        name: 'TechFest_Robotics_Rulebook_2026.pdf',
        title: 'Robotics Rulebook & Weight Regulations',
        category: 'Academics',
        size: '3.8 MB',
        uploadedBy: 'Alex Rivera',
      },
    ]);

    // 8. Create Risks
    await Risk.create([
      {
        eventId: innovatex._id,
        title: 'Main Hall Projector Bulb Life Expiry',
        severity: 'high',
        probability: 'high',
        status: 'open',
        owner: 'Sarah Miller (Logistics)',
        mitigation: 'Procure backup projector lamp from university inventory before Thursday soundcheck.',
      },
      {
        eventId: innovatex._id,
        title: 'Wi-Fi Bandwidth Limit in Block C',
        severity: 'medium',
        probability: 'medium',
        status: 'open',
        owner: 'Campus IT Liaison',
        mitigation: 'Requested extra enterprise AP routers; IT Department testing scheduled for Friday.',
      },
      {
        eventId: techfest._id,
        title: 'Polycarbonate Arena Shield Stress Fractures',
        severity: 'urgent',
        probability: 'low',
        status: 'open',
        owner: 'Alex Rivera',
        mitigation: 'Double-layer 10mm Lexan panels installed along combat perimeter.',
      },
    ]);

    // 9. Create Announcements
    await Announcement.create([
      {
        eventId: innovatex._id,
        title: 'Mandatory Volunteer Walkthrough on Friday at 4 PM',
        body: 'Please assemble at the Main Auditorium stage for headset distribution, emergency exit protocols, and zone assignments.',
        audience: 'All Volunteers (78)',
        author: 'Alex Chen',
        status: 'Sent',
      },
      {
        eventId: techfest._id,
        title: 'Heavyweight Battle Bot Scrutineering Schedule Released',
        body: 'Team captains must present machines for fail-safe kill switch tests between 9 AM and 11 AM.',
        audience: 'Robotics Participants & Pit Crew',
        author: 'Alex Rivera',
        status: 'Sent',
      },
    ]);

    console.log('[MongoDB Seed] Initial data successfully seeded into database collections.');
  } catch (err) {
    console.error('[MongoDB Seed Error]:', err.message);
  }
};
