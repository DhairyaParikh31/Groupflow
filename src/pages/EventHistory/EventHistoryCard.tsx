import { Event } from '../Events/types';

interface EventHistoryCardProps {
  event: Event;
  onViewHistory: () => void;
}

export default function EventHistoryCard({ event, onViewHistory }: EventHistoryCardProps) {
  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-2 mb-4">
        <h3 className="text-xl font-medium">{event.name}</h3>
        <p>Date: {formatDate(event.date)}</p>
        <p>Venue: {event.venue}</p>
        <p>Time: {event.time.start} to {event.time.end}</p>
        <p>Event Information: {event.information}</p>
      </div>
      
      <button
        onClick={onViewHistory}
        className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
      >
        See History
      </button>
    </div>
  );
}