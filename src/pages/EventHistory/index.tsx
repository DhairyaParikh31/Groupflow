import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import EventHistoryCard from './EventHistoryCard';
import Modal from '../../components/Modal';
import EventAttendanceList from './EventAttendanceList';
import { Event } from '../Events/types';
import { useAuth } from '../../contexts/AuthContext';

export default function EventHistory() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedEvents();
  }, []);

  const fetchCompletedEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch completed events
      const response = await fetch('/api/events?completed=true', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch completed events');
      }
      
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch completed events:', error);
      setError('Failed to fetch completed events');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReasons = async (eventId: string, reasons: Array<{ memberId: string; reason: string }>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/events/${eventId}/reasons`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reasons }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update absence reasons');
      }

      const updatedEvent = await response.json();
      
      // Update the events state with the updated event
      setEvents(prev => prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      
      // Update selected event if it's the one being edited
      if (selectedEvent && selectedEvent.id === updatedEvent.id) {
        setSelectedEvent(updatedEvent);
      }
      
      return updatedEvent;
    } catch (error) {
      console.error('Failed to update absence reasons:', error);
      setError(error instanceof Error ? error.message : 'Failed to update absence reasons');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event History</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          No completed events found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <EventHistoryCard
              key={event.id}
              event={event}
              onViewHistory={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title="Event Attendance History"
      >
        {selectedEvent && (
          <EventAttendanceList
            event={selectedEvent}
            onUpdateReasons={(reasons) => handleUpdateReasons(selectedEvent.id, reasons)}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </Modal>
    </Layout>
  );
}