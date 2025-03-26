import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import Modal from '../../components/Modal';
import EventsList from './EventsList';
import { Event } from '../Events/types';

export default function UpcomingEvents() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/events', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const fetchedEvents = await response.json();
      
      // Get current date and reset time to start of day for accurate comparison
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      // Get current month and year
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Filter events for the current month only
      const currentMonthEvents = fetchedEvents.filter((event: Event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getMonth() === currentMonth && 
          eventDate.getFullYear() === currentYear &&
          eventDate >= currentDate // Only include today and future events
        );
      });
      
      // Sort by date (closest first)
      currentMonthEvents.sort((a: Event, b: Event) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Filter all upcoming events (today and future) for the "See More" modal
      const upcomingEvents = fetchedEvents.filter((event: Event) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= currentDate;
      });
      
      // Sort all upcoming events by date
      upcomingEvents.sort((a: Event, b: Event) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      console.log('Current month events:', currentMonthEvents);
      console.log('All upcoming events:', upcomingEvents);
      
      setEvents(currentMonthEvents);
      setAllEvents(upcomingEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Get month name for the title
  const getCurrentMonthName = () => {
    return new Date().toLocaleString('default', { month: 'long' });
  };

  return (
    <>
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{getCurrentMonthName()} Events</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center"
          >
            See More... <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">Loading events...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No events found for {getCurrentMonthName()}</div>
        ) : (
          <EventsList events={events} limit={2} />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="All Upcoming Events"
      >
        {loading ? (
          <div className="p-6 text-center">Loading events...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : allEvents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No upcoming events found</div>
        ) : (
          <div className="p-6">
            <EventsList events={allEvents} />
          </div>
        )}
      </Modal>
    </>
  );
}