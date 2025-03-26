import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Event, Member } from './types';

interface AttendanceModalProps {
  event: Event;
  leaderId?: string;
  onClose: () => void;
  onUpdateAttendance: (leaderId: string, memberIds: string[]) => Promise<void>;
}

export default function AttendanceModal({ event, leaderId, onClose, onUpdateAttendance }: AttendanceModalProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!leaderId) {
          throw new Error('Leader ID is required');
        }
        
        const response = await fetch('/api/members', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        
        const data = await response.json();
        
        // Filter members by the selected leader
        const filteredMembers = data.filter((member: Member) => 
          member.leader === leaderId
        );
        
        setMembers(filteredMembers);

        // Pre-select members who are already marked as attending
        const leaderData = event.leaders.find(l => l.leader === leaderId);
        if (leaderData?.memberCount) {
          const [attended] = leaderData.memberCount.split('/');
          const attendedCount = parseInt(attended, 10);
          
          // If we have attendance data, pre-select the first N members
          // This is a simplification - ideally we'd store which specific members attended
          if (attendedCount > 0 && filteredMembers.length >= attendedCount) {
            setSelectedMembers(filteredMembers.slice(0, attendedCount).map(m => m.id));
          }
        }
      } catch (error) {
        console.error('Failed to fetch members:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [event, leaderId]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!leaderId) {
        throw new Error('Leader ID is required');
      }
      
      await onUpdateAttendance(leaderId, selectedMembers);
      setSuccess(true);
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to update attendance:', error);
      setError(error instanceof Error ? error.message : 'Failed to update attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading members...</div>;
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Update Attendance</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Attendance updated successfully!
        </div>
      )}
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {members.length === 0 ? (
          <p className="text-gray-500">No members found for this leader.</p>
        ) : (
          members.map((member) => (
            <label key={member.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
              <input
                type="checkbox"
                checked={selectedMembers.includes(member.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMembers([...selectedMembers, member.id]);
                  } else {
                    setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                  }
                }}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span>{member.name}</span>
            </label>
          ))
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 ${
            submitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Updating...' : 'Update Attendance'}
        </button>
      </div>
    </div>
  );
}