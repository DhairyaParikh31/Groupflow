import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateUser } from '../middleware/auth.js';
import { Member } from '../models/Member.js';
import { User } from '../models/User.js';

const router = express.Router();

// Get all members
router.get('/', authenticateUser, async (req, res) => {
  try {
    let query = {};
    
    // If user is a leader, only show their members
    if (req.user.role === 'leader') {
      query.leader = req.user._id;
    }

    const members = await Member.find(query)
      .populate('leader', 'name area')
      .populate('createdBy', 'name');

    const transformedMembers = members.map(member => ({
      id: member._id,
      name: member.name,
      dateOfBirth: member.dateOfBirth,
      address: member.address,
      anniversary: member.anniversary,
      maritalStatus: member.maritalStatus,
      leader: member.leader._id,
      leaderName: member.leader.name,
      area: member.leader.area, // Include leader's area
      phoneNumber: member.phoneNumber,
      email: member.email,
      status: member.status,
      photo: member.photo,
      customFields: member.customFields
    }));

    res.json(transformedMembers);
  } catch (error) {
    console.error('Failed to fetch members:', error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
});

// Create new member
router.post('/', 
  authenticateUser,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('leader').notEmpty().withMessage('Leader is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('status').isIn(['Active', 'Moderate', 'Inactive']).withMessage('Invalid status'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.state').notEmpty().withMessage('State is required'),
    body('address.pincode').notEmpty().withMessage('Pincode is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Verify that the leader exists
      const leader = await User.findById(req.body.leader);
      if (!leader || leader.role !== 'leader') {
        return res.status(400).json({ message: 'Invalid leader selected' });
      }

      const member = new Member({
        ...req.body,
        createdBy: req.user._id
      });

      await member.save();

      const populatedMember = await Member.findById(member._id)
        .populate('leader', 'name area')
        .populate('createdBy', 'name');

      const transformedMember = {
        id: populatedMember._id,
        name: populatedMember.name,
        dateOfBirth: populatedMember.dateOfBirth,
        address: populatedMember.address,
        anniversary: populatedMember.anniversary,
        maritalStatus: populatedMember.maritalStatus,
        leader: populatedMember.leader._id,
        leaderName: populatedMember.leader.name,
        area: populatedMember.leader.area, // Include leader's area
        phoneNumber: populatedMember.phoneNumber,
        email: populatedMember.email,
        status: populatedMember.status,
        photo: populatedMember.photo,
        customFields: populatedMember.customFields
      };

      res.status(201).json(transformedMember);
    } catch (error) {
      console.error('Failed to create member:', error);
      res.status(500).json({ message: 'Failed to create member' });
    }
});

// Get all leaders for member form
router.get('/leaders', authenticateUser, async (req, res) => {
  try {
    const leaders = await User.find({ role: 'leader' }).select('_id name area');
    res.json(leaders.map(leader => ({
      id: leader._id,
      name: leader.name,
      area: leader.area
    })));
  } catch (error) {
    console.error('Failed to fetch leaders:', error);
    res.status(500).json({ message: 'Failed to fetch leaders' });
  }
});

// Update member
router.put('/:id', 
  authenticateUser,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('status').isIn(['Active', 'Moderate', 'Inactive']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // If leader is being updated, verify the new leader exists
      if (req.body.leader) {
        const leader = await User.findById(req.body.leader);
        if (!leader || leader.role !== 'leader') {
          return res.status(400).json({ message: 'Invalid leader selected' });
        }
      }

      const member = await Member.findByIdAndUpdate(
        req.params.id,
        { 
          ...req.body,
          updatedAt: new Date()
        },
        { new: true }
      ).populate('leader', 'name area');

      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      const transformedMember = {
        id: member._id,
        name: member.name,
        dateOfBirth: member.dateOfBirth,
        address: member.address,
        anniversary: member.anniversary,
        maritalStatus: member.maritalStatus,
        leader: member.leader._id,
        leaderName: member.leader.name,
        area: member.leader.area, // Include leader's area
        phoneNumber: member.phoneNumber,
        email: member.email,
        status: member.status,
        photo: member.photo,
        customFields: member.customFields
      };

      res.json(transformedMember);
    } catch (error) {
      console.error('Failed to update member:', error);
      res.status(500).json({ message: 'Failed to update member' });
    }
});

// Delete member
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    // Check if member exists
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if user has permission to delete
    if (req.user.role !== 'admin' && member.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this member' });
    }

    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Failed to delete member:', error);
    res.status(500).json({ message: 'Failed to delete member' });
  }
});

export default router;