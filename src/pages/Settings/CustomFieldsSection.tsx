import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { customFieldService } from '../../services/customFieldService';

interface CustomFieldFormProps {
  onSubmit: (data: { name: string; fieldType: string; defaultValue: string }) => Promise<void>;
  onCancel: () => void;
}

function CustomFieldForm({ onSubmit, onCancel }: CustomFieldFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    fieldType: 'text',
    defaultValue: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name.trim()) {
      setError('Field name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save custom field');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Field Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter field name (e.g. Blood Group, Education)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Field Type</label>
          <select
            value={formData.fieldType}
            onChange={(e) => setFormData({ ...formData, fieldType: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Default Value</label>
          <input
            type={formData.fieldType === 'number' ? 'number' : 
                 formData.fieldType === 'date' ? 'date' : 
                 formData.fieldType === 'time' ? 'time' : 
                 formData.fieldType === 'email' ? 'email' : 'text'}
            value={formData.defaultValue}
            onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter default value for existing members"
          />
          <p className="mt-1 text-sm text-gray-500">
            This value will be applied to all existing members and leaders
          </p>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Adding...' : 'Add Field'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CustomFieldsSection() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const handleAddField = async (data: { name: string; fieldType: string; defaultValue: string }) => {
    try {
      await customFieldService.createCustomField(data);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add custom field:', err);
      throw err;
    }
  };

  // Only admins can manage custom fields
  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Custom Member Fields</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-black text-white px-3 py-1 rounded-md hover:bg-gray-800 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Field</span>
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add Custom Field"
      >
        <CustomFieldForm
          onSubmit={handleAddField}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}