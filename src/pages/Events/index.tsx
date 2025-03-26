import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import EventCard from './EventCard';
import EventForm from './EventForm';
import { Event } from './types';
import { useAuth } from '../../contexts/AuthContext';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/events?completed=false', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (data: Partial<Event>) => {
    try {
      setLoading(true);
      setError(null);
      const eventData = {
        name: data.name,
        date: data.date,
        venue: data.venue,
        time: {
          start: data.time?.start,
          end: data.time?.end
        },
        information: data.information
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      const newEvent = await response.json();
      setEvents(prev => [...prev, newEvent]);
      setShowEventForm(false);
    } catch (error) {
      console.error('Failed to create event:', error);
      setError(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (id: string, data: Partial<Event>) => {
    try {
      setLoading(true);
      setError(null);
      const eventData = {
        name: data.name,
        date: data.date,
        venue: data.venue,
        time: {
          start: data.time?.start,
          end: data.time?.end
        },
        information: data.information
      };

      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update event');
      }

      const updatedEvent = await response.json();
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to update event:', error);
      setError(error instanceof Error ? error.message : 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }

      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Failed to delete event:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (eventId: string, leaderId: string, memberIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/events/${eventId}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leaderId,
          memberIds
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update attendance');
      }

      const updatedEvent = await response.json();
      setEvents(prev => prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      
      return updatedEvent;
    } catch (error) {
      console.error('Failed to update attendance:', error);
      setError(error instanceof Error ? error.message : 'Failed to update attendance');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">List of Event</h1>
        <button
          onClick={() => setShowEventForm(true)}
          className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={() => setSelectedEvent(event)}
            onDelete={() => handleDeleteEvent(event.id)}
            onUpdateAttendance={(leaderId, memberIds) => 
              handleUpdateAttendance(event.id, leaderId, memberIds)
            }
          />
        ))}
      </div>

      {events.length === 0 && !loading && (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500">No events found. Click "Create New Event" to add one.</p>
        </div>
      )}

      <Modal
        isOpen={showEventForm || selectedEvent !== null}
        onClose={() => {
          setShowEventForm(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent ? 'Edit Event' : 'Add Event\'s Details'}
      >
        <EventForm
          onSubmit={selectedEvent 
            ? (data) => handleUpdateEvent(selectedEvent.id, data)
            : handleCreateEvent}
          onCancel={() => {
            setShowEventForm(false);
            setSelectedEvent(null);
          }}
          initialData={selectedEvent || undefined}
        />
      </Modal>
    </Layout>
  );
}