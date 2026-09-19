import mongoose from 'mongoose';
import Volunteer from '../models/Volunteer.js';

// In-memory fallback volunteers
export let inMemoryVolunteers = [
  {
    _id: 'vol_inno_1',
    eventId: 'evt_innovatex_2026',
    name: 'Maya Patel',
    email: 'maya.patel@campus.edu',
    role: 'Lead Usher',
    team: 'Hospitality',
    shift: 'Morning (08:00 - 13:00)',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'vol_inno_2',
    eventId: 'evt_innovatex_2026',
    name: 'Kavita Rao',
    email: 'kavita.rao@campus.edu',
    role: 'Stage Manager',
    team: 'A/V & Tech',
    shift: 'Full Day (09:00 - 18:00)',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'vol_tech_1',
    eventId: 'evt_techfest_2026',
    name: 'Alex Rivera',
    email: 'alex.rivera@campus.edu',
    role: 'Arena Safety Officer',
    team: 'Robotics Lead',
    shift: 'Morning (08:30 - 14:00)',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
];

// @desc    Get all volunteers belonging to an event
// @route   GET /api/events/:eventId/volunteers
// @access  Public
export const getVolunteersByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const volunteers = await Volunteer.find({ eventId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: volunteers.length,
        data: volunteers,
      });
    }

    // Fallback: In-memory store
    const volunteers = inMemoryVolunteers.filter((v) => String(v.eventId) === String(eventId));
    return res.status(200).json({
      success: true,
      count: volunteers.length,
      data: volunteers,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single volunteer by ID
// @route   GET /api/volunteers/:volunteerId
// @access  Public
export const getVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(volunteerId)) {
      const volunteer = await Volunteer.findById(volunteerId);
      if (!volunteer) {
        return res.status(404).json({
          success: false,
          message: `Volunteer not found with id of ${volunteerId}`,
        });
      }
      return res.status(200).json({
        success: true,
        data: volunteer,
      });
    }

    // Fallback: In-memory store
    const volunteer = inMemoryVolunteers.find((v) => String(v._id) === String(volunteerId));
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: `Volunteer not found with id of ${volunteerId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: volunteer,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new volunteer for an event
// @route   POST /api/events/:eventId/volunteers
// @access  Public
export const createVolunteer = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { name, email, phone, role, team, shift, status } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required in URL',
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer name is required',
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const volunteer = await Volunteer.create({
        eventId,
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : '',
        phone: phone ? phone.trim() : '',
        role: role ? role.trim() : 'Volunteer',
        team: team ? team.trim() : 'General',
        shift: shift ? shift.trim() : 'Full Day',
        status: status || 'confirmed',
      });

      return res.status(201).json({
        success: true,
        data: volunteer,
      });
    }

    // Fallback: In-memory store
    const newVolunteer = {
      _id: `vol_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      eventId: String(eventId),
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      phone: phone ? phone.trim() : '',
      role: role ? role.trim() : 'Volunteer',
      team: team ? team.trim() : 'General',
      shift: shift ? shift.trim() : 'Full Day',
      status: status || 'confirmed',
      createdAt: new Date().toISOString(),
    };

    inMemoryVolunteers.unshift(newVolunteer);

    return res.status(201).json({
      success: true,
      data: newVolunteer,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a volunteer by ID
// @route   PUT /api/volunteers/:volunteerId
// @access  Public
export const updateVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(volunteerId)) {
      const updateData = { ...req.body };
      delete updateData.eventId;

      const volunteer = await Volunteer.findByIdAndUpdate(volunteerId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!volunteer) {
        return res.status(404).json({
          success: false,
          message: `Volunteer not found with id of ${volunteerId}`,
        });
      }

      return res.status(200).json({
        success: true,
        data: volunteer,
      });
    }

    // Fallback: In-memory store
    const index = inMemoryVolunteers.findIndex((v) => String(v._id) === String(volunteerId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Volunteer not found with id of ${volunteerId}`,
      });
    }

    const { eventId, ...allowedUpdates } = req.body;
    inMemoryVolunteers[index] = {
      ...inMemoryVolunteers[index],
      ...allowedUpdates,
    };

    return res.status(200).json({
      success: true,
      data: inMemoryVolunteers[index],
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a volunteer by ID
// @route   DELETE /api/volunteers/:volunteerId
// @access  Public
export const deleteVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(volunteerId)) {
      const volunteer = await Volunteer.findByIdAndDelete(volunteerId);
      if (!volunteer) {
        return res.status(404).json({
          success: false,
          message: `Volunteer not found with id of ${volunteerId}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Volunteer deleted successfully',
        data: {},
      });
    }

    // Fallback: In-memory store
    const index = inMemoryVolunteers.findIndex((v) => String(v._id) === String(volunteerId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Volunteer not found with id of ${volunteerId}`,
      });
    }

    inMemoryVolunteers.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Volunteer deleted successfully',
      data: {},
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};
