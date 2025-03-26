import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateUser, authorizeAdmin } from '../middleware/auth.js';
import { CustomField } from '../models/CustomField.js';
import { Member } from '../models/Member.js';
import { Leader } from '../models/Leader.js';

const router = express.Router();

// Get all custom fields
router.get('/', authenticateUser, async (req, res) => {
  try {
    const customFields = await CustomField.find().sort({ createdAt: -1 });
    res.json(customFields);
  } catch (error) {
    console.error('Failed to fetch custom fields:', error);
    res.status(500).json({ message: 'Failed to fetch custom fields' });
  }
});

// Create new custom field
router.post('/', 
  authenticateUser,
  authorizeAdmin,
  [
    body('name').trim().notEmpty().withMessage('Field name is required'),
    body('fieldType').isIn(['text', 'number', 'date', 'time', 'email']).withMessage('Invalid field type'),
    body('defaultValue').trim().optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, fieldType = 'text', defaultValue = '' } = req.body;

      // Check if field with this name already exists
      const existingField = await CustomField.findOne({ name });
      if (existingField) {
        return res.status(400).json({ message: 'A field with this name already exists' });
      }

      // Create new custom field
      const customField = new CustomField({
        name,
        fieldType,
        defaultValue
      });

      await customField.save();

      // Add this field to all existing members with the default value
      await Member.updateMany(
        {}, 
        { 
          $push: { 
            customFields: { 
              name, 
              value: defaultValue 
            } 
          } 
        }
      );

      // Add this field to all existing leaders with the default value
      await Leader.updateMany(
        {}, 
        { 
          $push: { 
            customFields: { 
              name, 
              value: defaultValue 
            } 
          } 
        }
      );

      res.status(201).json(customField);
    } catch (error) {
      console.error('Failed to create custom field:', error);
      res.status(500).json({ message: 'Failed to create custom field' });
    }
});

// Update custom field
router.put('/:id',
  authenticateUser,
  authorizeAdmin,
  [
    body('name').trim().notEmpty().withMessage('Field name is required'),
    body('fieldType').isIn(['text', 'number', 'date', 'time', 'email']).withMessage('Invalid field type'),
    body('defaultValue').trim().optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, fieldType = 'text', defaultValue = '' } = req.body;
      const customField = await CustomField.findById(req.params.id);
      
      if (!customField) {
        return res.status(404).json({ message: 'Custom field not found' });
      }

      // Check if new name conflicts with another field
      if (name !== customField.name) {
        const existingField = await CustomField.findOne({ 
          name,
          _id: { $ne: customField._id }
        });
        if (existingField) {
          return res.status(400).json({ message: 'A field with this name already exists' });
        }
      }

      // Get old name for updating members and leaders
      const oldName = customField.name;

      // Update custom field
      customField.name = name;
      customField.fieldType = fieldType;
      customField.defaultValue = defaultValue;
      await customField.save();

      // Update field name and value in all members
      await Member.updateMany(
        { 'customFields.name': oldName },
        { 
          $set: { 
            'customFields.$.name': name,
            'customFields.$.value': defaultValue
          } 
        }
      );

      // Update field name and value in all leaders
      await Leader.updateMany(
        { 'customFields.name': oldName },
        { 
          $set: { 
            'customFields.$.name': name,
            'customFields.$.value': defaultValue
          } 
        }
      );

      res.json(customField);
    } catch (error) {
      console.error('Failed to update custom field:', error);
      res.status(500).json({ message: 'Failed to update custom field' });
    }
});

// Delete custom field
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const customField = await CustomField.findById(req.params.id);
    
    if (!customField) {
      return res.status(404).json({ message: 'Custom field not found' });
    }

    // Remove this field from all members
    await Member.updateMany(
      {},
      { $pull: { customFields: { name: customField.name } } }
    );

    // Remove this field from all leaders
    await Leader.updateMany(
      {},
      { $pull: { customFields: { name: customField.name } } }
    );

    // Delete the custom field
    await CustomField.findByIdAndDelete(req.params.id);

    res.json({ message: 'Custom field deleted successfully' });
  } catch (error) {
    console.error('Failed to delete custom field:', error);
    res.status(500).json({ message: 'Failed to delete custom field' });
  }
});

export const customFieldRouter = router;