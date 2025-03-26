import { useState } from 'react';
import { Pencil, Trash2, Users } from 'lucide-react';
import { Event } from './types';
import Modal from '../../components/Modal';
import AttendanceModal from './AttendanceModal';
import { useAuth } from '../../contexts/AuthContext';

interface EventCardProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateAttendance: (leaderId: string, memberIds: string[]) => Promise<void>;
}

export default function EventCard({ event, onEdit, onDelete, onUpdateAttendance }: EventCardProps) {
  const { user } = useAuth();
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<string | null>(null);

  const handleAttendanceClick = (leaderId: string) => {
    if (user?.role === 'admin' || user?.id === leaderId) {
      setSelectedLeader(leaderId);
      setShowAttendance(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (time: { start: string; end: string }) => {
    return `${time.start} to ${time.end}`;
  };

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <h3 className="text-xl font-medium">{event.name}</h3>
          <div className="flex space-x-2 self-end sm:self-start">
            <button 
              onClick={onEdit} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Edit event"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button 
              onClick={onDelete} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Delete event"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <p className="text-sm"><span className="font-medium">Date:</span> {formatDate(event.date)}</p>
            <p className="text-sm"><span className="font-medium">Time:</span> {formatTime(event.time)}</p>
          </div>
          <p className="text-sm"><span className="font-medium">Venue:</span> {event.venue}</p>
          <p className="text-sm"><span className="font-medium">Information:</span> {event.information}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Attendance</h4>
          <div className="grid gap-3">
            {event.leaders?.map((leader) => (
              <div 
                key={leader.leader} 
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <span className="flex-1 text-sm truncate">{leader.name}</span>
                <button
                  onClick={() => handleAttendanceClick(leader.leader)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    user?.role === 'admin' || user?.id === leader.leader
                      ? 'bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors'
                      : 'bg-gray-100 cursor-default'
                  }`}
                >
                  {leader.memberCount || '0/0'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAttendance}
        onClose={() => {
          setShowAttendance(false);
          setSelectedLeader(null);
        }}
        title="Update Attendance"
      >
        <AttendanceModal
          event={event}
          leaderId={selectedLeader || undefined}
          onClose={() => {
            setShowAttendance(false);
            setSelectedLeader(null);
          }}
          onUpdateAttendance={onUpdateAttendance}
        />
      </Modal>
    </>
  );
}