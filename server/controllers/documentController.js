import mongoose from 'mongoose';
import Document from '../models/Document.js';

// In-memory fallback documents
export let inMemoryDocuments = [
  {
    _id: 'doc_inno_1',
    eventId: 'evt_innovatex_2026',
    name: 'InnovateX_2026_Event_Proposal.pdf',
    title: 'InnovateX 2026 Event Proposal',
    category: 'Approvals',
    size: '2.4 MB',
    uploadedBy: 'Alex Chen',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'doc_inno_2',
    eventId: 'evt_innovatex_2026',
    name: 'Auditorium_A_V_Stage_Floorplan.pdf',
    title: 'Auditorium Floorplan',
    category: 'Logistics',
    size: '5.1 MB',
    uploadedBy: 'Sarah Miller',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'doc_tech_1',
    eventId: 'evt_techfest_2026',
    name: 'TechFest_Robotics_Rulebook_2026.pdf',
    title: 'Robotics Rulebook & Weight Regulations',
    category: 'Academics',
    size: '3.8 MB',
    uploadedBy: 'Alex Rivera',
    createdAt: new Date().toISOString(),
  },
];

// @desc    Get all documents belonging to an event
// @route   GET /api/events/:eventId/documents
// @access  Public
export const getDocumentsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const documents = await Document.find({ eventId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: documents.length,
        data: documents,
      });
    }

    // Fallback: In-memory store
    const documents = inMemoryDocuments.filter((d) => String(d.eventId) === String(eventId));
    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document by ID
// @route   GET /api/documents/:documentId
// @access  Public
export const getDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(documentId)) {
      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({
          success: false,
          message: `Document not found with id of ${documentId}`,
        });
      }
      return res.status(200).json({
        success: true,
        data: document,
      });
    }

    // Fallback: In-memory store
    const document = inMemoryDocuments.find((d) => String(d._id) === String(documentId));
    if (!document) {
      return res.status(404).json({
        success: false,
        message: `Document not found with id of ${documentId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: document,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new document for an event
// @route   POST /api/events/:eventId/documents
// @access  Public
export const createDocument = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { name, title, description, size, category, fileUrl, uploadedBy } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required in URL',
      });
    }

    const docName = name || title;
    if (!docName || !docName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Document name or title is required',
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const document = await Document.create({
        eventId,
        name: docName.trim(),
        title: title ? title.trim() : docName.trim(),
        description: description ? description.trim() : '',
        size: size ? size.trim() : '1.0 MB',
        category: category ? category.trim() : 'General',
        fileUrl: fileUrl ? fileUrl.trim() : '',
        uploadedBy: uploadedBy ? uploadedBy.trim() : 'Event Lead',
      });

      return res.status(201).json({
        success: true,
        data: document,
      });
    }

    // Fallback: In-memory store
    const newDoc = {
      _id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      eventId: String(eventId),
      name: docName.trim(),
      title: title ? title.trim() : docName.trim(),
      description: description ? description.trim() : '',
      size: size ? size.trim() : '1.0 MB',
      category: category ? category.trim() : 'General',
      fileUrl: fileUrl ? fileUrl.trim() : '',
      uploadedBy: uploadedBy ? uploadedBy.trim() : 'Event Lead',
      createdAt: new Date().toISOString(),
    };

    inMemoryDocuments.unshift(newDoc);

    return res.status(201).json({
      success: true,
      data: newDoc,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a document by ID
// @route   PUT /api/documents/:documentId
// @access  Public
export const updateDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(documentId)) {
      const updateData = { ...req.body };
      delete updateData.eventId;

      const document = await Document.findByIdAndUpdate(documentId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: `Document not found with id of ${documentId}`,
        });
      }

      return res.status(200).json({
        success: true,
        data: document,
      });
    }

    // Fallback: In-memory store
    const index = inMemoryDocuments.findIndex((d) => String(d._id) === String(documentId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Document not found with id of ${documentId}`,
      });
    }

    const { eventId, ...allowedUpdates } = req.body;
    inMemoryDocuments[index] = {
      ...inMemoryDocuments[index],
      ...allowedUpdates,
    };

    return res.status(200).json({
      success: true,
      data: inMemoryDocuments[index],
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a document by ID
// @route   DELETE /api/documents/:documentId
// @access  Public
export const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(documentId)) {
      const document = await Document.findByIdAndDelete(documentId);
      if (!document) {
        return res.status(404).json({
          success: false,
          message: `Document not found with id of ${documentId}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
        data: {},
      });
    }

    // Fallback: In-memory store
    const index = inMemoryDocuments.findIndex((d) => String(d._id) === String(documentId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Document not found with id of ${documentId}`,
      });
    }

    inMemoryDocuments.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      data: {},
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};
