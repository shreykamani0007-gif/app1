import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';

// In-memory fallback announcements
export let inMemoryAnnouncements = [
  {
    _id: 'anno_inno_1',
    eventId: 'evt_innovatex_2026',
    title: 'Mandatory Volunteer Walkthrough on Friday at 4 PM',
    body: 'Please assemble at the Main Auditorium stage for headset distribution, emergency exit protocols, and zone assignments.',
    content: 'Please assemble at the Main Auditorium stage for headset distribution, emergency exit protocols, and zone assignments.',
    audience: 'All Volunteers (78)',
    author: 'Alex Chen',
    createdBy: 'Alex Chen',
    status: 'Sent',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: 'anno_inno_2',
    eventId: 'evt_innovatex_2026',
    title: 'Sponsor Booth Floor Plan Updated',
    body: 'Google Cloud and Red Bull booths have swapped locations due to high-voltage power outlet requirements.',
    content: 'Google Cloud and Red Bull booths have swapped locations due to high-voltage power outlet requirements.',
    audience: 'Core Team & Tech Leads',
    author: 'Priya Rao',
    createdBy: 'Priya Rao',
    status: 'Sent',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    _id: 'anno_tech_1',
    eventId: 'evt_techfest_2026',
    title: 'Heavyweight Battle Bot Scrutineering Schedule Released',
    body: 'Team captains must present machines for fail-safe kill switch tests between 9 AM and 11 AM.',
    content: 'Team captains must present machines for fail-safe kill switch tests between 9 AM and 11 AM.',
    audience: 'Robotics Participants & Pit Crew',
    author: 'Alex Rivera',
    createdBy: 'Alex Rivera',
    status: 'Sent',
    createdAt: new Date().toISOString(),
  },
];

// @desc    Get all announcements belonging to an event
// @route   GET /api/events/:eventId/announcements
// @access  Public
export const getAnnouncementsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const announcements = await Announcement.find({ eventId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: announcements.length,
        data: announcements,
      });
    }

    // Fallback: In-memory store
    const announcements = inMemoryAnnouncements.filter((a) => String(a.eventId) === String(eventId));
    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single announcement by ID
// @route   GET /api/announcements/:announcementId
// @access  Public
export const getAnnouncement = async (req, res, next) => {
  try {
    const { announcementId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(announcementId)) {
      const announcement = await Announcement.findById(announcementId);
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: `Announcement not found with id of ${announcementId}`,
        });
      }
      return res.status(200).json({
        success: true,
        data: announcement,
      });
    }

    // Fallback: In-memory store
    const announcement = inMemoryAnnouncements.find((a) => String(a._id) === String(announcementId));
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: `Announcement not found with id of ${announcementId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: announcement,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new announcement for an event
// @route   POST /api/events/:eventId/announcements
// @access  Public
export const createAnnouncement = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { title, body, content, audience, author, createdBy, status } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required in URL',
      });
    }

    const textBody = body || content;
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Announcement title is required',
      });
    }

    if (!textBody || !textBody.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Announcement body or content is required',
      });
    }

    const resolvedAuthor = author || createdBy || 'Event Lead';

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const announcement = await Announcement.create({
        eventId,
        title: title.trim(),
        body: textBody.trim(),
        content: textBody.trim(),
        audience: audience ? audience.trim() : 'All Volunteers',
        author: resolvedAuthor.trim(),
        createdBy: resolvedAuthor.trim(),
        status: status || 'Sent',
      });

      return res.status(201).json({
        success: true,
        data: announcement,
      });
    }

    // Fallback: In-memory store
    const newAnno = {
      _id: `anno_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      eventId: String(eventId),
      title: title.trim(),
      body: textBody.trim(),
      content: textBody.trim(),
      audience: audience ? audience.trim() : 'All Volunteers',
      author: resolvedAuthor.trim(),
      createdBy: resolvedAuthor.trim(),
      status: status || 'Sent',
      createdAt: new Date().toISOString(),
    };

    inMemoryAnnouncements.unshift(newAnno);

    return res.status(201).json({
      success: true,
      data: newAnno,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an announcement by ID
// @route   PUT /api/announcements/:announcementId
// @access  Public
export const updateAnnouncement = async (req, res, next) => {
  try {
    const { announcementId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(announcementId)) {
      const updateData = { ...req.body };
      delete updateData.eventId;

      if (updateData.body && !updateData.content) updateData.content = updateData.body;
      if (updateData.content && !updateData.body) updateData.body = updateData.content;
      if (updateData.author && !updateData.createdBy) updateData.createdBy = updateData.author;
      if (updateData.createdBy && !updateData.author) updateData.author = updateData.createdBy;

      const announcement = await Announcement.findByIdAndUpdate(announcementId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: `Announcement not found with id of ${announcementId}`,
        });
      }

      return res.status(200).json({
        success: true,
        data: announcement,
      });
    }

    // Fallback: In-memory store
    const index = inMemoryAnnouncements.findIndex((a) => String(a._id) === String(announcementId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Announcement not found with id of ${announcementId}`,
      });
    }

    const { eventId, ...allowedUpdates } = req.body;
    inMemoryAnnouncements[index] = {
      ...inMemoryAnnouncements[index],
      ...allowedUpdates,
    };

    return res.status(200).json({
      success: true,
      data: inMemoryAnnouncements[index],
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an announcement by ID
// @route   DELETE /api/announcements/:announcementId
// @access  Public
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { announcementId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(announcementId)) {
      const announcement = await Announcement.findByIdAndDelete(announcementId);
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: `Announcement not found with id of ${announcementId}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Announcement deleted successfully',
        data: {},
      });
    }

    // Fallback: In-memory store
    const index = inMemoryAnnouncements.findIndex((a) => String(a._id) === String(announcementId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Announcement not found with id of ${announcementId}`,
      });
    }

    inMemoryAnnouncements.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
      data: {},
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};
