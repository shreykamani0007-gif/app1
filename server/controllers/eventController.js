import mongoose from 'mongoose';
import Event from '../models/Event.js';

// In-memory fallback store when MongoDB is not actively connected
let inMemoryEvents = [
  {
    _id: 'evt_innovatex_2026',
    name: 'InnovateX Fest 2026',
    description: '36-hour national collegiate hackathon, keynote speaker tracks, and tech club project exhibitions.',
    date: '2026-10-12T09:00:00.000Z',
    location: 'University Student Center & Main Audi',
    status: 'Ongoing',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'evt_techfest_2026',
    name: 'TechFest 2026',
    description: 'Annual inter-college robotics championship, paper presentations, and coding league.',
    date: '2026-11-05T10:00:00.000Z',
    location: 'Campus Engineering Block & Quad',
    status: 'Planning',
    createdAt: new Date().toISOString(),
  },
];

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const events = await Event.find().sort({ date: 1, createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: events.length,
        data: events,
      });
    }

    // Fallback: In-memory store when MongoDB is offline
    res.status(200).json({
      success: true,
      count: inMemoryEvents.length,
      data: inMemoryEvents,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with id of ${req.params.id}`,
        });
      }
      return res.status(200).json({
        success: true,
        data: event,
      });
    }

    // Fallback: In-memory store
    const event = inMemoryEvents.find(e => e._id === req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      data: event,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Public
export const createEvent = async (req, res, next) => {
  try {
    const { name, description, date, location, status } = req.body;

    if (!name || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both event name and date',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const event = await Event.create({
        name,
        description,
        date,
        location,
        status: status || 'Planning',
      });
      return res.status(201).json({
        success: true,
        data: event,
      });
    }

    // Fallback: In-memory store
    const newEvent = {
      _id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name,
      description: description || '',
      date,
      location: location || '',
      status: status || 'Planning',
      createdAt: new Date().toISOString(),
    };
    inMemoryEvents.unshift(newEvent);

    res.status(201).json({
      success: true,
      data: newEvent,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Public
export const updateEvent = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with id of ${req.params.id}`,
        });
      }
      return res.status(200).json({
        success: true,
        data: event,
      });
    }

    // Fallback: In-memory store
    const index = inMemoryEvents.findIndex(e => e._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`,
      });
    }

    inMemoryEvents[index] = {
      ...inMemoryEvents[index],
      ...req.body,
    };

    res.status(200).json({
      success: true,
      data: inMemoryEvents[index],
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Public
export const deleteEvent = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const event = await Event.findByIdAndDelete(req.params.id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with id of ${req.params.id}`,
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
        data: {},
      });
    }

    // Fallback: In-memory store
    const index = inMemoryEvents.findIndex(e => e._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`,
      });
    }

    inMemoryEvents.splice(index, 1);
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: {},
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};
