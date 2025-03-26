import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import { authenticateUser } from '../middleware/auth.js';
import { SharedInformation } from '../models/SharedInformation.js';

const router = express.Router();

// Configure multer for memory storage (not disk storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all shared information
router.get('/', authenticateUser, async (req, res) => {
  try {
    const sharedInfo = await SharedInformation.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(sharedInfo.map(info => ({
      id: info._id,
      title: info.title,
      content: info.content,
      attachments: info.attachments.map(attachment => ({
        id: attachment._id,
        filename: attachment.filename,
        contentType: attachment.contentType,
        size: attachment.size
      })),
      createdBy: info.createdBy.name,
      createdAt: info.createdAt
    })));
  } catch (error) {
    console.error('Failed to fetch shared information:', error);
    res.status(500).json({ message: 'Failed to fetch shared information' });
  }
});

// Get a specific attachment
router.get('/attachment/:id/:attachmentId', authenticateUser, async (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    
    const info = await SharedInformation.findById(id);
    if (!info) {
      return res.status(404).json({ message: 'Shared information not found' });
    }
    
    const attachment = info.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    
    res.set('Content-Type', attachment.contentType);
    res.set('Content-Disposition', `attachment; filename="${attachment.filename}"`);
    res.send(attachment.data);
  } catch (error) {
    console.error('Failed to fetch attachment:', error);
    res.status(500).json({ message: 'Failed to fetch attachment' });
  }
});

// Create new shared information
router.post('/', 
  authenticateUser,
  upload.array('attachments', 5), // Allow up to 5 files
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Process uploaded files
      const attachments = req.files ? req.files.map(file => ({
        filename: file.originalname,
        contentType: file.mimetype,
        data: file.buffer,
        size: file.size
      })) : [];

      const sharedInfo = new SharedInformation({
        title: req.body.title,
        content: req.body.content,
        attachments: attachments,
        createdBy: req.user._id
      });

      await sharedInfo.save();

      // Return the created information with populated user
      const populatedInfo = await SharedInformation.findById(sharedInfo._id)
        .populate('createdBy', 'name');

      res.status(201).json({
        id: populatedInfo._id,
        title: populatedInfo.title,
        content: populatedInfo.content,
        attachments: populatedInfo.attachments.map(attachment => ({
          id: attachment._id,
          filename: attachment.filename,
          contentType: attachment.contentType,
          size: attachment.size
        })),
        createdBy: populatedInfo.createdBy.name,
        createdAt: populatedInfo.createdAt
      });
    } catch (error) {
      console.error('Failed to share information:', error);
      res.status(500).json({ message: 'Failed to share information' });
    }
});

// Update shared information
router.put('/:id', 
  authenticateUser,
  upload.array('attachments', 5),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Find the shared info
      const sharedInfo = await SharedInformation.findById(req.params.id);
      if (!sharedInfo) {
        return res.status(404).json({ message: 'Shared information not found' });
      }

      // Check if user is authorized to update (creator or admin)
      if (sharedInfo.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this information' });
      }

      // Process new uploaded files
      const newAttachments = req.files ? req.files.map(file => ({
        filename: file.originalname,
        contentType: file.mimetype,
        data: file.buffer,
        size: file.size
      })) : [];

      // Get existing attachments to keep
      const existingAttachments = req.body.keepAttachments 
        ? JSON.parse(req.body.keepAttachments) 
        : [];
      
      // Filter out attachments that should be kept
      sharedInfo.attachments = sharedInfo.attachments.filter(
        attachment => existingAttachments.includes(attachment._id.toString())
      );
      
      // Add new attachments
      sharedInfo.attachments.push(...newAttachments);
      
      // Update other fields
      sharedInfo.title = req.body.title;
      sharedInfo.content = req.body.content;

      await sharedInfo.save();

      // Return the updated info
      const updatedInfo = await SharedInformation.findById(req.params.id)
        .populate('createdBy', 'name');

      res.json({
        id: updatedInfo._id,
        title: updatedInfo.title,
        content: updatedInfo.content,
        attachments: updatedInfo.attachments.map(attachment => ({
          id: attachment._id,
          filename: attachment.filename,
          contentType: attachment.contentType,
          size: attachment.size
        })),
        createdBy: updatedInfo.createdBy.name,
        createdAt: updatedInfo.createdAt
      });
    } catch (error) {
      console.error('Failed to update information:', error);
      res.status(500).json({ message: 'Failed to update information' });
    }
});

// Delete shared information
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const sharedInfo = await SharedInformation.findById(req.params.id);
    if (!sharedInfo) {
      return res.status(404).json({ message: 'Shared information not found' });
    }

    // Check if user is authorized to delete (creator or admin)
    if (sharedInfo.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this information' });
    }

    // Delete the shared info
    await SharedInformation.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Information deleted successfully' });
  } catch (error) {
    console.error('Failed to delete information:', error);
    res.status(500).json({ message: 'Failed to delete information' });
  }
});

export const sharedInfoRouter = router;