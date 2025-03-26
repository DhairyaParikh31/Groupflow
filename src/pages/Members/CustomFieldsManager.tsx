import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { CustomField } from '../../types/member';
import { customFieldService } from '../../services/customFieldService';
import Modal from '../../components/Modal';

interface CustomFieldFormProps {
  field?: CustomField;
  onSubmit: (data: { name: string; fieldType: string; defaultValue: string }) => Promise<void>;
  onCancel: () => void;
}

function CustomFieldForm({ field, onSubmit, onCancel }: CustomFieldFormProps) {
  const [formData, setFormData] = useState({
    name: field?.name || '',
    fieldType: field?.fieldType || 'text',
    defaultValue: field?.defaultValue || ''
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
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
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
          <label className="block text-sm font-medium text-gray-700">Default Value (for existing members)</label>
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
            This value will be applied to all existing members. New members will have this field empty.
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
            {isSubmitting ? 'Saving...' : field ? 'Update Field' : 'Add Field'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CustomFieldsManager() {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    if (showManager) {
      fetchCustomFields();
    }
  }, [showManager]);

  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const fields = await customFieldService.getCustomFields();
      setCustomFields(fields);
    } catch (err) {
      setError('Failed to fetch custom fields');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async (data: { name: string; fieldType: string; defaultValue: string }) => {
    try {
      const newField = await customFieldService.createCustomField(data);
      setCustomFields(prev => [...prev, newField]);
      setModalType(null);
    } catch (err) {
      console.error('Failed to add custom field:', err);
      throw err;
    }
  };

  const handleUpdateField = async (data: { name: string; fieldType: string; defaultValue: string }) => {
    if (!selectedField?.id) {
      console.error('No field selected for update');
      return;
    }
    
    try {
      const updatedField = await customFieldService.updateCustomField(selectedField.id, data);
      setCustomFields(prev => prev.map(field => 
        field.id === updatedField.id ? updatedField : field
      ));
      setModalType(null);
      setSelectedField(null);
    } catch (err) {
      console.error('Failed to update custom field:', err);
      throw err;
    }
  };

  const handleDeleteField = async () => {
    if (!selectedField?.id) {
      console.error('No field selected for deletion');
      return;
    }
    
    try {
      await customFieldService.deleteCustomField(selectedField.id);
      setCustomFields(prev => prev.filter(field => field.id !== selectedField.id));
      setModalType(null);
      setSelectedField(null);
      setDeleteConfirmation('');
    } catch (err) {
      console.error('Failed to delete custom field:', err);
      setError('Failed to delete custom field');
    }
  };

  if (!showManager) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Custom Member Fields</h2>
          <button
            onClick={() => setShowManager(true)}
            className="flex items-center space-x-2 bg-black text-white px-3 py-1 rounded-md hover:bg-gray-800 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Custom Fields</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Custom Member Fields</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowManager(false)}
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
          >
            Close
          </button>
          <button
            onClick={() => setModalType('add')}
            className="flex items-center space-x-2 bg-black text-white px-3 py-1 rounded-md hover:bg-gray-800 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Field</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading custom fields...</div>
      ) : customFields.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
          No custom fields defined. Click "Add Field" to create one.
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {customFields.map((field) => (
            <div 
              key={field.id} 
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{field.name}</h3>
                <div className="flex space-x-4 text-sm text-gray-500">
                  <span>Type: {field.fieldType}</span>
                  <span>Default: {field.defaultValue || '(empty)'}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedField(field);
                    setModalType('edit');
                  }}
                  className="p-1 hover:text-blue-600"
                  title="Edit field"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedField(field);
                    setModalType('delete');
                  }}
                  className="p-1 hover:text-red-600"
                  title="Delete field"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Field Modal */}
      <Modal
        isOpen={modalType === 'add' || modalType === 'edit'}
        onClose={() => {
          setModalType(null);
          setSelectedField(null);
        }}
        title={modalType === 'add' ? 'Add Custom Field' : 'Edit Custom Field'}
      >
        <CustomFieldForm
          field={selectedField || undefined}
          onSubmit={modalType === 'add' ? handleAddField : handleUpdateField}
          onCancel={() => {
            setModalType(null);
            setSelectedField(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalType === 'delete'}
        onClose={() => {
          setModalType(null);
          setSelectedField(null);
          setDeleteConfirmation('');
        }}
        title="Delete Custom Field"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to delete the field "{selectedField?.name}"? This will remove this field from all members and cannot be undone.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="DELETE"
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setModalType(null);
                setSelectedField(null);
                setDeleteConfirmation('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteField}
              disabled={deleteConfirmation !== 'DELETE'}
              className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
                deleteConfirmation !== 'DELETE' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Delete Field
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}