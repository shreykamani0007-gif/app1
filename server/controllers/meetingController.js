import mongoose from 'mongoose';
import Meeting from '../models/Meeting.js';

// In-memory fallback meetings linked to specific events
export let inMemoryMeetings = [
  // InnovateX Fest 2026 Meetings
  {
    _id: 'meet_inno_1',
    eventId: 'evt_innovatex_2026',
    title: 'Weekly Core Committee Sync',
    date: '2026-10-02',
    startTime: '05:00 PM',
    endTime: '06:00 PM',
    meetingType: 'In-person',
    location: 'Student Union Room 302',
    meetingLink: '',
    organizer: 'Alex Chen (Lead Coordinator)',
    participants: [
      { id: 'vol_inno_1', name: 'Maya Patel', role: 'Lead Usher', team: 'Hospitality', email: 'maya@campus.edu', status: 'Expected' },
      { id: 'vol_inno_2', name: 'Kavita Rao', role: 'Stage Manager', team: 'A/V & Tech', email: 'kavita@campus.edu', status: 'Confirmed' },
      { id: 'vol_inno_3', name: 'Rohan Sharma', role: 'Registration Desk', team: 'Logistics', email: 'rohan@campus.edu', status: 'Confirmed' },
      { id: 'vol_inno_5', name: 'Sarah Jenkins', role: 'Hackathon Proctor', team: 'Tech Support', email: 'sarah@campus.edu', status: 'Expected' },
      { id: 'vol_inno_6', name: 'David Kim', role: 'Catering Lead', team: 'Hospitality', email: 'david@campus.edu', status: 'Expected' },
    ],
    agenda: '1. Review sponsor booth arrangements in the main hall.\n2. Finalize volunteer shift rotations for Day 1.\n3. Validate electrical load and high-voltage outlets with facilities.',
    description: 'Weekly status checkpoint with team captains and coordinators to identify blockers ahead of the hackathon kickoff.',
    status: 'Scheduled',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'meet_inno_2',
    eventId: 'evt_innovatex_2026',
    title: 'Hackathon Logistics & Vendor Walkthrough',
    date: '2026-10-05',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    meetingType: 'Hybrid',
    location: 'Auditorium Main Stage',
    meetingLink: 'https://meet.google.com/inno-logistics-2026',
    organizer: 'Sarah Miller (Logistics)',
    participants: [
      { id: 'vol_inno_3', name: 'Rohan Sharma', role: 'Registration Desk', team: 'Logistics', email: 'rohan@campus.edu', status: 'Confirmed' },
      { id: 'vol_inno_8', name: 'Marcus Vance', role: 'Badge Distribution', team: 'Logistics', email: 'marcus@campus.edu', status: 'Expected' },
      { id: 'vol_inno_9', name: 'Elena Rostova', role: 'Safety Liaison', team: 'Operations', email: 'elena@campus.edu', status: 'Confirmed' },
    ],
    agenda: '1. Physical inspection of sound reinforcement and microphone packs.\n2. Sign off on food truck and catering access routes at East gate.\n3. Review badge barcode scanners and spare receipt printers.',
    description: 'On-site walkthrough with university facilities management and external A/V rental partners.',
    status: 'Scheduled',
    createdAt: new Date().toISOString(),
  },

  // TechFest 2026 Meetings
  {
    _id: 'meet_tech_1',
    eventId: 'evt_techfest_2026',
    title: 'Robotics Arena & Safety Briefing',
    date: '2026-10-08',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    meetingType: 'In-person',
    location: 'Robotics Lab & Arena Zone 4',
    meetingLink: '',
    organizer: 'Alex Rivera (Arena Safety Officer)',
    participants: [
      { id: 'vol_tech_1', name: 'Alex Rivera', role: 'Arena Safety Officer', team: 'Robotics Lead', email: 'alex@campus.edu', status: 'Confirmed' },
      { id: 'vol_tech_3', name: 'Tariq Mansoor', role: 'Hardware Inspection', team: 'Tech Crew', email: 'tariq@campus.edu', status: 'Expected' },
      { id: 'vol_tech_5', name: 'Lucas Silva', role: 'Live Stream Operator', team: 'Media & Sound', email: 'lucas@campus.edu', status: 'Expected' },
    ],
    agenda: '1. Test emergency kill-switch system across fighting robot cages.\n2. Inspect Lexan polycarbonate safety shield barriers.\n3. Verify fire extinguisher placements and first-aid kits.',
    description: 'Safety audit required by Faculty Advisor before heavy battle-bots can enter the testing perimeter.',
    status: 'Scheduled',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'meet_tech_2',
    eventId: 'evt_techfest_2026',
    title: 'Title Sponsors & Press Briefing',
    date: '2026-10-12',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    meetingType: 'Online',
    location: '',
    meetingLink: 'https://meet.google.com/techfest-press-sync',
    organizer: 'Sophia W. (Sponsorship Head)',
    participants: [
      { id: 'vol_tech_2', name: 'Chloe Dupont', role: 'Coding League Proctor', team: 'Academics', email: 'chloe@campus.edu', status: 'Confirmed' },
      { id: 'vol_tech_6', name: 'Zoe Washington', role: 'Scoreboard Coordinator', team: 'Operations', email: 'zoe@campus.edu', status: 'Expected' },
    ],
    agenda: '1. Finalize co-branded lanyard proofs with printing partner.\n2. Confirm press passes for collegiate tech journalists.\n3. Outline keynote speaking order for opening ceremony.',
    description: 'Virtual alignment call with corporate sponsors and media leads.',
    status: 'Scheduled',
    createdAt: new Date().toISOString(),
  },
];

// @desc    Get all meetings belonging to an event
// @route   GET /api/events/:eventId/meetings
// @access  Public
export const getMeetingsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required in URL',
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const meetings = await Meeting.find({ eventId }).sort({ date: 1, startTime: 1 });
      return res.status(200).json({
        success: true,
        count: meetings.length,
        data: meetings,
      });
    }

    // Fallback: In-memory store
    const meetings = inMemoryMeetings.filter((m) => String(m.eventId) === String(eventId));
    return res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meeting by ID
// @route   GET /api/meetings/:meetingId
// @access  Public
export const getMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(meetingId)) {
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: `Meeting not found with id of ${meetingId}`,
        });
      }
      return res.status(200).json({
        success: true,
        data: meeting,
      });
    }

    // Fallback: In-memory store
    const meeting = inMemoryMeetings.find((m) => String(m._id) === String(meetingId));
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: `Meeting not found with id of ${meetingId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: meeting,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule a new meeting for an event
// @route   POST /api/events/:eventId/meetings
// @access  Public
export const createMeeting = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const {
      title,
      date,
      startTime,
      endTime,
      meetingType,
      location,
      meetingLink,
      organizer,
      participants,
      agenda,
      description,
      status,
    } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required in URL',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Meeting title is required',
      });
    }

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Date, start time, and end time are required',
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const meeting = await Meeting.create({
        eventId,
        title: title.trim(),
        date,
        startTime,
        endTime,
        meetingType: meetingType || 'In-person',
        location: location ? location.trim() : '',
        meetingLink: meetingLink ? meetingLink.trim() : '',
        organizer: organizer ? organizer.trim() : 'Event Lead',
        participants: Array.isArray(participants) ? participants : [],
        agenda: agenda ? agenda.trim() : '',
        description: description ? description.trim() : '',
        status: status || 'Scheduled',
      });

      return res.status(201).json({
        success: true,
        data: meeting,
      });
    }

    // Fallback: In-memory store
    const newMeeting = {
      _id: `meet_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      eventId: String(eventId),
      title: title.trim(),
      date,
      startTime,
      endTime,
      meetingType: meetingType || 'In-person',
      location: location ? location.trim() : '',
      meetingLink: meetingLink ? meetingLink.trim() : '',
      organizer: organizer ? organizer.trim() : 'Event Lead',
      participants: Array.isArray(participants) ? participants : [],
      agenda: agenda ? agenda.trim() : '',
      description: description ? description.trim() : '',
      status: status || 'Scheduled',
      createdAt: new Date().toISOString(),
    };

    inMemoryMeetings.unshift(newMeeting);

    return res.status(201).json({
      success: true,
      data: newMeeting,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a meeting by ID
// @route   PUT /api/meetings/:meetingId
// @access  Public
export const updateMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(meetingId)) {
      const updateData = { ...req.body };
      delete updateData.eventId; // Enforce eventId cannot be changed accidentally

      const meeting = await Meeting.findByIdAndUpdate(meetingId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: `Meeting not found with id of ${meetingId}`,
        });
      }

      return res.status(200).json({
        success: true,
        data: meeting,
      });
    }

    // Fallback: In-memory store
    const index = inMemoryMeetings.findIndex((m) => String(m._id) === String(meetingId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Meeting not found with id of ${meetingId}`,
      });
    }

    const { eventId, ...allowedUpdates } = req.body;
    inMemoryMeetings[index] = {
      ...inMemoryMeetings[index],
      ...allowedUpdates,
    };

    return res.status(200).json({
      success: true,
      data: inMemoryMeetings[index],
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a meeting by ID
// @route   DELETE /api/meetings/:meetingId
// @access  Public
export const deleteMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(meetingId)) {
      const meeting = await Meeting.findByIdAndDelete(meetingId);
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: `Meeting not found with id of ${meetingId}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Meeting deleted successfully',
        data: {},
      });
    }

    // Fallback: In-memory store
    const index = inMemoryMeetings.findIndex((m) => String(m._id) === String(meetingId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Meeting not found with id of ${meetingId}`,
      });
    }

    inMemoryMeetings.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully',
      data: {},
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};
