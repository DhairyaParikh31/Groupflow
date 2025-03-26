import express from 'express';
import { Leader } from '../models/Leader.js';
import { User } from '../models/User.js';
import { Member } from '../models/Member.js';
import { authenticateUser, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all leaders
router.get('/', authenticateUser, async (req, res) => {
  try {
    const leaders = await Leader.find().populate('userId', 'email area');
    const members = await Member.find();
    
    // Transform the data to match the frontend expectations
    const transformedLeaders = await Promise.all(leaders.map(async leader => {
      const user = leader.userId;
      
      // Filter members for this leader
      const leaderMembers = members.filter(member => member.leader.toString() === user._id.toString());
      const activeMembers = leaderMembers.filter(member => 
        member.status === 'Active' || member.status === 'Moderate'
      ).length;
      const totalMembers = leaderMembers.length;

      return {
        id: leader._id,
        name: leader.name,
        email: user.email,
        area: user.area,
        dateOfBirth: leader.dateOfBirth,
        address: leader.address,
        anniversary: leader.anniversary,
        maritalStatus: leader.maritalStatus,
        phoneNumber: leader.phoneNumber,
        photo: leader.photo,
        activeMembers,
        totalMembers,
        userId: user._id // Include userId for member matching
      };
    }));

    res.json(transformedLeaders);
  } catch (error) {
    console.error('Failed to fetch leaders:', error);
    res.status(500).json({ message: 'Failed to fetch leaders' });
  }
});

// Create leader profile
router.post('/', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { userId, ...leaderData } = req.body;
    
    // Verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const leader = new Leader({
      userId,
      ...leaderData
    });
    
    await leader.save();

    // Return the leader data in the expected format
    const transformedLeader = {
      id: leader._id,
      name: leader.name,
      email: user.email,
      area: user.area,
      dateOfBirth: leader.dateOfBirth,
      address: leader.address,
      anniversary: leader.anniversary,
      maritalStatus: leader.maritalStatus,
      phoneNumber: leader.phoneNumber,
      photo: leader.photo,
      activeMembers: leader.activeMembers,
      totalMembers: leader.totalMembers
    };

    res.status(201).json(transformedLeader);
  } catch (error) {
    console.error('Failed to create leader profile:', error);
    res.status(500).json({ message: 'Failed to create leader profile' });
  }
});

// Update leader
router.put('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const leader = await Leader.findById(req.params.id);
    if (!leader) {
      return res.status(404).json({ message: 'Leader not found' });
    }

    // Update leader profile
    Object.assign(leader, req.body);
    await leader.save();

    // Update user's name and area if provided
    if (req.body.name || req.body.area || req.body.email) {
      const user = await User.findById(leader.userId);
      if (user) {
        if (req.body.name) user.name = req.body.name;
        if (req.body.area) user.area = req.body.area;
        if (req.body.email) user.email = req.body.email;
        await user.save();
      }
    }

    // Get updated leader with user data
    const updatedLeader = await Leader.findById(req.params.id).populate('userId', 'email area');
    
    const transformedLeader = {
      id: updatedLeader._id,
      name: updatedLeader.name,
      email: updatedLeader.userId.email,
      area: updatedLeader.userId.area,
      dateOfBirth: updatedLeader.dateOfBirth,
      address: updatedLeader.address,
      anniversary: updatedLeader.anniversary,
      maritalStatus: updatedLeader.maritalStatus,
      phoneNumber: updatedLeader.phoneNumber,
      photo: updatedLeader.photo,
      activeMembers: updatedLeader.activeMembers,
      totalMembers: updatedLeader.totalMembers
    };

    res.json(transformedLeader);
  } catch (error) {
    console.error('Failed to update leader:', error);
    res.status(500).json({ message: 'Failed to update leader' });
  }
});

// Delete leader
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const leader = await Leader.findById(req.params.id);
    if (!leader) {
      return res.status(404).json({ message: 'Leader not found' });
    }

    // Delete associated user account
    await User.findByIdAndDelete(leader.userId);
    // Delete leader profile
    await Leader.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Leader deleted successfully' });
  } catch (error) {
    console.error('Failed to delete leader:', error);
    res.status(500).json({ message: 'Failed to delete leader' });
  }
});

export const leaderRouter = router;