import mongoose from 'mongoose';
import Risk from '../models/Risk.js';

// In-memory fallback risks
export let inMemoryRisks = [
  {
    _id: 'risk_inno_1',
    eventId: 'evt_innovatex_2026',
    title: 'Main Hall Projector Bulb Life Expiry',
    description: 'Projector lamp may exceed operational lifespan during the keynote track.',
    category: 'Technical',
    severity: 'high',
    status: 'open',
    owner: 'Sarah Miller (Logistics)',
    mitigation: 'Procure backup projector lamp from university inventory or rental partner before Thursday soundcheck.',
    probability: 'medium',
    impact: 'High',
    dueDate: '2026-10-10',
    notes: 'Bulb hours currently at 2,850 / 3,000 rating.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'risk_inno_2',
    eventId: 'evt_innovatex_2026',
    title: 'Wi-Fi Bandwidth Limit in Block C',
    description: 'Concurrent device saturation during hackathon coding sprints may throttle internet speeds.',
    category: 'Technical',
    severity: 'medium',
    status: 'monitoring',
    owner: 'Campus IT Liaison',
    mitigation: 'Requested extra enterprise AP routers; IT Department testing scheduled for Friday.',
    probability: 'high',
    impact: 'Medium',
    dueDate: '2026-10-11',
    notes: 'Expected 600 concurrent devices across hackathon floors.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'risk_tech_1',
    eventId: 'evt_techfest_2026',
    title: 'Robotics Arena Polycarbonate Barrier Scratches / Visibility',
    description: 'Impact debris could impair spectator sightlines and safety certification.',
    category: 'Safety',
    severity: 'high',
    status: 'open',
    owner: 'Alex Rivera (Robotics Lead)',
    mitigation: 'Inspect panels on setup day; apply optical polishing compound or swap damaged sheets with spares.',
    probability: 'medium',
    impact: 'High',
    dueDate: '2026-11-03',
    notes: 'Combat robotics safety regulation compliance mandatory.',
    createdAt: new Date().toISOString(),
  },
];

// @desc    Get all risks belonging to an event
// @route   GET /api/events/:eventId/risks
// @access  Public
export const getRisksByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const risks = await Risk.find({ eventId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: risks.length,
        data: risks,
      });
    }

    // Fallback: In-memory store
    const risks = inMemoryRisks.filter((r) => String(r.eventId) === String(eventId));
    return res.status(200).json({
      success: true,
      count: risks.length,
      data: risks,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single risk by ID
// @route   GET /api/risks/:riskId
// @access  Public
export const getRisk = async (req, res, next) => {
  try {
    const { riskId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(riskId)) {
      const risk = await Risk.findById(riskId);
      if (!risk) {
        return res.status(404).json({
          success: false,
          message: `Risk not found with id of ${riskId}`,
        });
      }
      return res.status(200).json({
        success: true,
        data: risk,
      });
    }

    // Fallback: In-memory store
    const risk = inMemoryRisks.find((r) => String(r._id) === String(riskId));
    if (!risk) {
      return res.status(404).json({
        success: false,
        message: `Risk not found with id of ${riskId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: risk,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new risk for an event
// @route   POST /api/events/:eventId/risks
// @access  Public
export const createRisk = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const {
      title,
      description,
      category,
      severity,
      probability,
      impact,
      status,
      owner,
      mitigation,
      dueDate,
      notes,
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
        message: 'Risk title is required',
      });
    }

    const safeSeverity = (severity || 'medium').toLowerCase();
    const safeProbability = (probability || 'medium').toLowerCase();
    const safeStatus = (status || 'open').toLowerCase();

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const risk = await Risk.create({
        eventId,
        title: title.trim(),
        description: description ? description.trim() : '',
        category: category ? category.trim() : 'General',
        severity: ['low', 'medium', 'high', 'critical', 'urgent'].includes(safeSeverity) ? safeSeverity : 'medium',
        probability: ['low', 'medium', 'high'].includes(safeProbability) ? safeProbability : 'medium',
        impact: impact ? impact.trim() : 'Medium',
        status: ['open', 'resolved', 'monitoring'].includes(safeStatus) ? safeStatus : 'open',
        owner: owner ? owner.trim() : 'Risk Officer',
        mitigation: mitigation ? mitigation.trim() : '',
        dueDate: dueDate ? dueDate.trim() : '',
        notes: notes ? notes.trim() : '',
      });

      return res.status(201).json({
        success: true,
        data: risk,
      });
    }

    // Fallback: In-memory store
    const newRisk = {
      _id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      eventId: String(eventId),
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category ? category.trim() : 'General',
      severity: safeSeverity,
      probability: safeProbability,
      impact: impact ? impact.trim() : 'Medium',
      status: safeStatus,
      owner: owner ? owner.trim() : 'Risk Officer',
      mitigation: mitigation ? mitigation.trim() : '',
      dueDate: dueDate ? dueDate.trim() : '',
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString(),
    };

    inMemoryRisks.unshift(newRisk);

    return res.status(201).json({
      success: true,
      data: newRisk,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a risk by ID
// @route   PUT /api/risks/:riskId
// @access  Public
export const updateRisk = async (req, res, next) => {
  try {
    const { riskId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(riskId)) {
      const updateData = { ...req.body };
      delete updateData.eventId;

      if (updateData.severity) updateData.severity = updateData.severity.toLowerCase();
      if (updateData.probability) updateData.probability = updateData.probability.toLowerCase();
      if (updateData.status) updateData.status = updateData.status.toLowerCase();

      const risk = await Risk.findByIdAndUpdate(riskId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!risk) {
        return res.status(404).json({
          success: false,
          message: `Risk not found with id of ${riskId}`,
        });
      }

      return res.status(200).json({
        success: true,
        data: risk,
      });
    }

    // Fallback: In-memory store
    const index = inMemoryRisks.findIndex((r) => String(r._id) === String(riskId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Risk not found with id of ${riskId}`,
      });
    }

    const { eventId, ...allowedUpdates } = req.body;
    inMemoryRisks[index] = {
      ...inMemoryRisks[index],
      ...allowedUpdates,
    };

    return res.status(200).json({
      success: true,
      data: inMemoryRisks[index],
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a risk by ID
// @route   DELETE /api/risks/:riskId
// @access  Public
export const deleteRisk = async (req, res, next) => {
  try {
    const { riskId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(riskId)) {
      const risk = await Risk.findByIdAndDelete(riskId);
      if (!risk) {
        return res.status(404).json({
          success: false,
          message: `Risk not found with id of ${riskId}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Risk deleted successfully',
        data: {},
      });
    }

    // Fallback: In-memory store
    const index = inMemoryRisks.findIndex((r) => String(r._id) === String(riskId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Risk not found with id of ${riskId}`,
      });
    }

    inMemoryRisks.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Risk deleted successfully',
      data: {},
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};
