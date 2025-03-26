import { useState } from 'react';
import { Event } from '../Events/types';
import Modal from '../../components/Modal';
import EventDetailCard from './EventDetailCard';

interface EventsListProps {
  events: Event[];
  limit?: number;
}

export default function EventsList({ events, limit }: EventsListProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateAttendance = (event: Event) => {
    let totalAttended = 0;
    let totalMembers = 0;
    
    event.leaders.forEach(leader => {
      const [attended, total] = leader.memberCount.split('/').map(Number);
      totalAttended += isNaN(attended) ? 0 : attended;
      totalMembers += isNaN(total) ? 0 : total;
    });
    
    return `${totalAttended}/${totalMembers}`;
  };

  const displayEvents = limit && events.length > limit ? events.slice(0, limit) : events;

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No upcoming events found.
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {displayEvents.map((event) => (
        <div 
          key={event.id} 
          className="bg-gray-50 rounded-xl p-3 md:p-4 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setSelectedEvent(event)}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-2 md:space-y-0">
            <div className="space-y-1">
              <h3 className="text-base md:text-lg font-medium line-clamp-1">{event.name}</h3>
              <p className="text-sm text-gray-600">Total Attendance: {calculateAttendance(event)}</p>
            </div>
            <span className="text-sm text-gray-400">{formatDate(event.date)}</span>
          </div>
        </div>
      ))}

      <Modal
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
      >
        {selectedEvent && (
          <EventDetailCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </Modal>
    </div>
  );
}