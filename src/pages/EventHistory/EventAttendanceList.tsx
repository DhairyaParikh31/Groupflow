import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Event } from '../Events/types';

interface EventAttendanceListProps {
  event: Event;
  onUpdateReasons: (reasons: Array<{ memberId: string; reason: string }>) => Promise<void>;
  onClose: () => void;
}

export default function EventAttendanceList({ event, onUpdateReasons, onClose }: EventAttendanceListProps) {
  const { user } = useAuth();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize reasons from event data
  useEffect(() => {
    if (event.attendees) {
      const initialReasons: Record<string, string> = {};
      event.attendees.forEach(attendee => {
        if (!attendee.attended && attendee.reason) {
          initialReasons[attendee.id] = attendee.reason;
        }
      });
      setReasons(initialReasons);
    }
  }, [event]);

  const handleReasonChange = (memberId: string, reason: string) => {
    setReasons(prev => ({
      ...prev,
      [memberId]: reason
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Format reasons for API
      const reasonsArray = Object.entries(reasons)
        .filter(([memberId]) => canEditReason(memberId)) // Only include reasons for members the user can edit
        .map(([memberId, reason]) => ({
          memberId,
          reason
        }));
      
      await onUpdateReasons(reasonsArray);
      setSuccess(true);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to update reasons:', error);
      setError(error instanceof Error ? error.message : 'Failed to update reasons');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user can edit reasons (admin or leader of the member)
  const canEditReason = (memberId: string) => {
    if (user?.role === 'admin') return true;
    
    if (user?.role === 'leader' && event.attendees) {
      const member = event.attendees.find(a => a.id === memberId);
      return member?.leader === user.id;
    }
    
    return false;
  };

  // Group attendees by attendance status
  const attendedMembers = event.attendees?.filter(a => a.attended) || [];
  const absentMembers = event.attendees?.filter(a => !a.attended) || [];

  // Check if user can submit any reasons (admin or leader with at least one member)
  const canSubmitReasons = user?.role === 'admin' || 
    (user?.role === 'leader' && absentMembers.some(member => member.leader === user.id));

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{event.name}</h3>
        <p className="text-gray-600">
          {new Date(event.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Absence reasons updated successfully!
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        <h4 className="font-medium">Member's Attendance</h4>
        
        <div className="grid grid-cols-2 gap-4 font-medium text-gray-700 mb-2">
          <div>Member's Name</div>
          <div>Reason</div>
        </div>
        
        {/* Absent members (with reason input) */}
        {absentMembers.map(member => (
          <div 
            key={member.id} 
            className="grid grid-cols-2 gap-4 items-center bg-red-100 p-3 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm">{member.name.charAt(0)}</span>
                </div>
              )}
              <span>{member.name}</span>
            </div>
            <div>
              {canEditReason(member.id) ? (
                <input
                  type="text"
                  value={reasons[member.id] || ''}
                  onChange={(e) => handleReasonChange(member.id, e.target.value)}
                  placeholder="Enter reason for absence"
                  className="w-full p-2 border border-red-300 rounded"
                />
              ) : (
                <p className="text-gray-700">{reasons[member.id] || 'No reason provided'}</p>
              )}
            </div>
          </div>
        ))}
        
        {/* Attended members */}
        {attendedMembers.map(member => (
          <div 
            key={member.id} 
            className="grid grid-cols-2 gap-4 items-center bg-green-100 p-3 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm">{member.name.charAt(0)}</span>
                </div>
              )}
              <span>{member.name}</span>
            </div>
            <div>
              <span className="text-green-700">Attended</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Close
        </button>
        {canSubmitReasons && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Updating...' : 'Update Reasons'}
          </button>
        )}
      </div>
    </div>
  );
}