import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateUser } from '../middleware/auth.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { Member } from '../models/Member.js';

const router = express.Router();

// Get all events
router.get('/', authenticateUser, async (req, res) => {
  try {
    // Check for query parameter to filter completed events
    const showCompleted = req.query.completed === 'true';
    
    // Get current date and time
    const now = new Date();
    
    // Find events based on completion status
    const events = await Event.find({ isCompleted: showCompleted })
      .populate('leaders.leader', 'name')
      .populate('attendees.member', 'name photo')
      .sort({ date: 1 });

    // For active events, check if any have ended and mark them as completed
    if (!showCompleted) {
      const eventsToUpdate = [];
      
      for (const event of events) {
        const eventDate = new Date(event.date);
        const [endHours, endMinutes] = event.time.end.split(':').map(Number);
        
        // Set event end time
        eventDate.setHours(endHours, endMinutes);
        
        // If event has ended, mark it as completed
        if (eventDate < now && !event.isCompleted) {
          event.isCompleted = true;
          eventsToUpdate.push(event.save());
        }
      }
      
      // Save all updated events
      if (eventsToUpdate.length > 0) {
        await Promise.all(eventsToUpdate);
      }
    }

    // Get all members for count calculations
    const members = await Member.find();

    // Transform events to include leader details and counts
    const transformedEvents = events
      .filter(event => event.isCompleted === showCompleted) // Filter again after updates
      .map(event => ({
        id: event._id,
        name: event.name,
        date: event.date,
        venue: event.venue,
        time: event.time,
        information: event.information,
        isCompleted: event.isCompleted,
        attendees: event.attendees.map(attendee => {
          // Find the member to get their leader
          const member = members.find(m => 
            m._id.toString() === (attendee.member?._id || attendee.member)?.toString()
          );
          
          return {
            id: attendee.member?._id || attendee.member,
            name: attendee.member?.name || 'Unknown Member',
            photo: attendee.member?.photo || null,
            attended: attendee.attended,
            reason: attendee.reason,
            leader: member?.leader?.toString() // Add leader ID to each attendee
          };
        }),
        leaders: event.leaders.map(leader => {
          // Calculate total members for this leader
          const totalMembers = members.filter(m => 
            m.leader?.toString() === leader.leader._id.toString()
          ).length;

          // Get current attendance count or default to 0
          const [attended = 0] = (leader.memberCount || '0/0').split('/');

          return {
            leader: leader.leader._id,
            name: leader.leader.name,
            memberCount: `${attended}/${totalMembers}`
          };
        })
      }));

    res.json(transformedEvents);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Create new event
router.post('/', 
  authenticateUser,
  [
    body('name').trim().notEmpty().withMessage('Event name is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('time.start').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required'),
    body('time.end').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required'),
    body('information').trim().notEmpty().withMessage('Event information is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get all leaders and their member counts
      const leaders = await User.find({ role: 'leader' });
      const members = await Member.find();

      // Create event with all leaders and their initial counts
      const event = new Event({
        ...req.body,
        leaders: await Promise.all(leaders.map(async leader => {
          const totalMembers = members.filter(m => 
            m.leader.toString() === leader._id.toString()
          ).length;

          return {
            leader: leader._id,
            memberCount: `0/${totalMembers}`
          };
        })),
        // Initialize attendees array with all members
        attendees: members.map(member => ({
          member: member._id,
          attended: false,
          reason: ''
        }))
      });

      await event.save();

      // Return formatted event
      const populatedEvent = await Event.findById(event._id)
        .populate('leaders.leader', 'name')
        .populate('attendees.member', 'name photo');

      const transformedEvent = {
        id: populatedEvent._id,
        name: populatedEvent.name,
        date: populatedEvent.date,
        venue: populatedEvent.venue,
        time: populatedEvent.time,
        information: populatedEvent.information,
        isCompleted: populatedEvent.isCompleted,
        attendees: populatedEvent.attendees.map(attendee => {
          // Find the member to get their leader
          const member = members.find(m => 
            m._id.toString() === (attendee.member?._id || attendee.member).toString()
          );
          
          return {
            id: attendee.member?._id || attendee.member,
            name: attendee.member?.name || 'Unknown Member',
            photo: attendee.member?.photo || null,
            attended: attendee.attended,
            reason: attendee.reason,
            leader: member?.leader.toString() // Add leader ID to each attendee
          };
        }),
        leaders: populatedEvent.leaders.map(leader => ({
          leader: leader.leader._id,
          name: leader.leader.name,
          memberCount: leader.memberCount
        }))
      };

      res.status(201).json(transformedEvent);
    } catch (error) {
      console.error('Failed to create event:', error);
      res.status(500).json({ message: 'Failed to create event' });
    }
});

// Update event
router.put('/:id',
  authenticateUser,
  [
    body('name').trim().notEmpty().withMessage('Event name is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('time.start').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required'),
    body('time.end').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required'),
    body('information').trim().notEmpty().withMessage('Event information is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Update basic event details but preserve leaders array
      event.name = req.body.name;
      event.date = req.body.date;
      event.venue = req.body.venue;
      event.time = req.body.time;
      event.information = req.body.information;

      await event.save();

      // Get all members for leader information
      const members = await Member.find();

      // Return updated event
      const updatedEvent = await Event.findById(req.params.id)
        .populate('leaders.leader', 'name')
        .populate('attendees.member', 'name photo');

      const transformedEvent = {
        id: updatedEvent._id,
        name: updatedEvent.name,
        date: updatedEvent.date,
        venue: updatedEvent.venue,
        time: updatedEvent.time,
        information: updatedEvent.information,
        isCompleted: updatedEvent.isCompleted,
        attendees: updatedEvent.attendees.map(attendee => {
          // Find the member to get their leader
          const member = members.find(m => 
            m._id.toString() === (attendee.member?._id || attendee.member).toString()
          );
          
          return {
            id: attendee.member?._id || attendee.member,
            name: attendee.member?.name || 'Unknown Member',
            photo: attendee.member?.photo || null,
            attended: attendee.attended,
            reason: attendee.reason,
            leader: member?.leader.toString() // Add leader ID to each attendee
          };
        }),
        leaders: updatedEvent.leaders.map(leader => ({
          leader: leader.leader._id,
          name: leader.leader.name,
          memberCount: leader.memberCount
        }))
      };

      res.json(transformedEvent);
    } catch (error) {
      console.error('Failed to update event:', error);
      res.status(500).json({ message: 'Failed to update event' });
    }
});

// Update event attendance
router.put('/:id/attendance',
  authenticateUser,
  async (req, res) => {
    try {
      const { leaderId, memberIds } = req.body;
      
      // Validate request
      if (!leaderId) {
        return res.status(400).json({ message: 'Leader ID is required' });
      }
      if (!Array.isArray(memberIds)) {
        return res.status(400).json({ message: 'Member IDs must be an array' });
      }

      // Find the event
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Get total members for this leader
      const totalMembers = await Member.countDocuments({ leader: leaderId });

      // Find the leader's index in the event's leaders array
      const leaderIndex = event.leaders.findIndex(
        l => l.leader.toString() === leaderId
      );

      if (leaderIndex === -1) {
        return res.status(400).json({ message: 'Leader not found in event' });
      }

      // Update the member count
      event.leaders[leaderIndex].memberCount = `${memberIds.length}/${totalMembers}`;
      
      // Update attendance status for each member
      const leaderMembers = await Member.find({ leader: leaderId });
      
      leaderMembers.forEach(member => {
        const memberIndex = event.attendees.findIndex(
          a => a.member.toString() === member._id.toString()
        );
        
        if (memberIndex !== -1) {
          // Mark as attended if in the memberIds array
          event.attendees[memberIndex].attended = memberIds.includes(member._id.toString());
        }
      });
      
      // Save the updated event
      await event.save();

      // Get all members for leader information
      const members = await Member.find();

      // Return updated event
      const updatedEvent = await Event.findById(req.params.id)
        .populate('leaders.leader', 'name')
        .populate('attendees.member', 'name photo');

      const transformedEvent = {
        id: updatedEvent._id,
        name: updatedEvent.name,
        date: updatedEvent.date,
        venue: updatedEvent.venue,
        time: updatedEvent.time,
        information: updatedEvent.information,
        isCompleted: updatedEvent.isCompleted,
        attendees: updatedEvent.attendees.map(attendee => {
          // Find the member to get their leader
          const member = members.find(m => 
            m._id.toString() === (attendee.member?._id || attendee.member).toString()
          );
          
          return {
            id: attendee.member?._id || attendee.member,
            name: attendee.member?.name || 'Unknown Member',
            photo: attendee.member?.photo || null,
            attended: attendee.attended,
            reason: attendee.reason,
            leader: member?.leader.toString() // Add leader ID to each attendee
          };
        }),
        leaders: updatedEvent.leaders.map(leader => ({
          leader: leader.leader._id,
          name: leader.leader.name,
          memberCount: leader.memberCount
        }))
      };

      res.json(transformedEvent);
    } catch (error) {
      console.error('Failed to update attendance:', error);
      res.status(500).json({ message: 'Failed to update attendance' });
    }
});

// Update absence reasons
router.put('/:id/reasons',
  authenticateUser,
  async (req, res) => {
    try {
      const { reasons } = req.body;
      
      // Validate request
      if (!reasons || !Array.isArray(reasons)) {
        return res.status(400).json({ message: 'Reasons must be an array' });
      }

      // Find the event
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Ensure the event is completed
      if (!event.isCompleted) {
        return res.status(400).json({ message: 'Can only update reasons for completed events' });
      }

      // Get all members to check permissions
      const members = await Member.find();
      
      // Check if user has permission to update these reasons
      if (req.user.role !== 'admin') {
        // For leaders, ensure they only update their own members
        for (const { memberId } of reasons) {
          const member = members.find(m => m._id.toString() === memberId);
          if (!member || member.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
              message: 'You can only update reasons for your own members' 
            });
          }
        }
      }

      // Update reasons for each member
      reasons.forEach(({ memberId, reason }) => {
        const memberIndex = event.attendees.findIndex(
          a => a.member.toString() === memberId
        );
        
        if (memberIndex !== -1 && !event.attendees[memberIndex].attended) {
          event.attendees[memberIndex].reason = reason;
        }
      });
      
      // Save the updated event
      await event.save();

      // Return updated event
      const updatedEvent = await Event.findById(req.params.id)
        .populate('leaders.leader', 'name')
        .populate('attendees.member', 'name photo');

      const transformedEvent = {
        id: updatedEvent._id,
        name: updatedEvent.name,
        date: updatedEvent.date,
        venue: updatedEvent.venue,
        time: updatedEvent.time,
        information: updatedEvent.information,
        isCompleted: updatedEvent.isCompleted,
        attendees: updatedEvent.attendees.map(attendee => {
          // Find the member to get their leader
          const member = members.find(m => 
            m._id.toString() === (attendee.member?._id || attendee.member).toString()
          );
          
          return {
            id: attendee.member?._id || attendee.member,
            name: attendee.member?.name || 'Unknown Member',
            photo: attendee.member?.photo || null,
            attended: attendee.attended,
            reason: attendee.reason,
            leader: member?.leader.toString() // Add leader ID to each attendee
          };
        }),
        leaders: updatedEvent.leaders.map(leader => ({
          leader: leader.leader._id,
          name: leader.leader.name,
          memberCount: leader.memberCount
        }))
      };

      res.json(transformedEvent);
    } catch (error) {
      console.error('Failed to update absence reasons:', error);
      res.status(500).json({ message: 'Failed to update absence reasons' });
    }
});

// Delete event
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

export const eventRouter = router;