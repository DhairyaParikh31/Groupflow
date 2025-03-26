import { Event } from '../Events/types';

interface EventDetailCardProps {
  event: Event;
  onClose: () => void;
}

export default function EventDetailCard({ event, onClose }: EventDetailCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Event Name</h3>
          <p className="mt-1 text-base md:text-lg font-semibold">{event.name}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Date</h3>
          <p className="mt-1 text-sm md:text-base">{formatDate(event.date)}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Time</h3>
          <p className="mt-1 text-sm md:text-base">{event.time.start} to {event.time.end}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Venue</h3>
          <p className="mt-1 text-sm md:text-base">{event.venue}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Information</h3>
          <p className="mt-1 text-sm md:text-base whitespace-pre-line">{event.information}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Attendance</h3>
          <div className="mt-2 space-y-2">
            {event.leaders.map((leader) => (
              <div key={leader.leader} className="flex justify-between items-center text-sm md:text-base">
                <span className="line-clamp-1">{leader.name}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm ml-2">
                  {leader.memberCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="w-full md:w-auto px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}