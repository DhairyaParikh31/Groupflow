import { useState, useEffect } from 'react';
import { Event } from './types';

interface EventFormProps {
  onSubmit: (data: Partial<Event>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Event>;
}

export default function EventForm({ onSubmit, onCancel, initialData }: EventFormProps) {
  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    date: formatDateForInput(initialData?.date) || '',
    venue: initialData?.venue || '',
    time: {
      start: initialData?.time?.start || '',
      end: initialData?.time?.end || ''
    },
    information: initialData?.information || ''
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        date: formatDateForInput(initialData.date) || '',
        venue: initialData.venue || '',
        time: {
          start: initialData.time?.start || '',
          end: initialData.time?.end || ''
        },
        information: initialData.information || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      alert('Event name is required');
      return;
    }
    if (!formData.date) {
      alert('Date is required');
      return;
    }
    if (!formData.time.start || !formData.time.end) {
      alert('Both start and end time are required');
      return;
    }
    if (!formData.venue.trim()) {
      alert('Venue is required');
      return;
    }
    if (!formData.information.trim()) {
      alert('Event information is required');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit event:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit event');
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter event name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Time</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              required
              value={formData.time.start}
              onChange={(e) => setFormData({
                ...formData,
                time: { ...formData.time, start: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <input
              type="time"
              required
              value={formData.time.end}
              onChange={(e) => setFormData({
                ...formData,
                time: { ...formData.time, end: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Venue</label>
          <input
            type="text"
            required
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter venue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            required
            value={formData.information}
            onChange={(e) => setFormData({ ...formData, information: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter event description"
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            {initialData ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}