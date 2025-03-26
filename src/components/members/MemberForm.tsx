import { useState, useEffect } from 'react';
import { Member, CustomField } from '../../types/member';
import ImageCropper from './ImageCropper';
import { X } from 'lucide-react';
import { customFieldService } from '../../services/customFieldService';
import { useAuth } from '../../contexts/AuthContext';

interface MemberFormProps {
  onSubmit: (data: Partial<Member>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Member>;
  leaders: Array<{ id: string; name: string }>;
  isEdit?: boolean;
}

export default function MemberForm({ onSubmit, onCancel, initialData, leaders, isEdit = false }: MemberFormProps) {
  const { user } = useAuth();
  
  // Format dates for input fields
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    dateOfBirth: formatDateForInput(initialData?.dateOfBirth),
    address: {
      street: initialData?.address?.street || '',
      city: initialData?.address?.city || '',
      state: initialData?.address?.state || '',
      pincode: initialData?.address?.pincode || ''
    },
    anniversary: formatDateForInput(initialData?.anniversary),
    maritalStatus: initialData?.maritalStatus || 'Single',
    leader: initialData?.leader || '',
    phoneNumber: initialData?.phoneNumber || '',
    email: initialData?.email || '',
    status: initialData?.status || 'Active',
    photo: initialData?.photo || '',
    customFields: initialData?.customFields || []
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch custom fields
  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      const fields = await customFieldService.getCustomFields();
      setCustomFields(fields);
      
      // For existing members, use their values
      // For new members, initialize with empty values
      if (fields.length > 0) {
        if (isEdit && initialData?.customFields) {
          // For editing, ensure all fields exist (in case new ones were added)
          const existingFieldNames = (initialData.customFields || []).map(f => f.name);
          const missingFields = fields.filter(field => !existingFieldNames.includes(field.name));
          
          if (missingFields.length > 0) {
            setFormData(prev => ({
              ...prev,
              customFields: [
                ...(prev.customFields || []),
                ...missingFields.map(field => ({ name: field.name, value: '' }))
              ]
            }));
          }
        } else {
          // For new members, initialize all fields with empty values
          setFormData(prev => ({
            ...prev,
            customFields: fields.map(field => ({ name: field.name, value: '' }))
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch custom fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setShowCropper(true);
    }
  };

  const handleCroppedImage = (croppedImage: string) => {
    setFormData({ ...formData, photo: croppedImage });
    setShowCropper(false);
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => {
      const updatedFields = [...(prev.customFields || [])];
      const fieldIndex = updatedFields.findIndex(f => f.name === fieldName);
      
      if (fieldIndex >= 0) {
        updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], value };
      } else {
        updatedFields.push({ name: fieldName, value });
      }
      
      return { ...prev, customFields: updatedFields };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await onSubmit(formData);
      onCancel();
    } catch (err) {
      console.error('Failed to submit member:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit member');
    }
  };

  // Get the appropriate input type based on field type
  const getInputType = (fieldType: string) => {
    switch (fieldType) {
      case 'number': return 'number';
      case 'date': return 'date';
      case 'time': return 'time';
      case 'email': return 'email';
      default: return 'text';
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Leader</label>
            <select
              required
              value={formData.leader}
              onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select Leader</option>
              {leaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marital Status</label>
            <select
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as 'Single' | 'Married' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          </div>

          {formData.maritalStatus === 'Married' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Anniversary</label>
              <input
                type="date"
                value={formData.anniversary}
                onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Moderate' | 'Inactive' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="Active">Active</option>
              <option value="Moderate">Moderate</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <input
              type="text"
              placeholder="Street"
              required
              value={formData.address.street}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value }
              })}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <input
              type="text"
              placeholder="City"
              required
              value={formData.address.city}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, city: e.target.value }
              })}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <input
              type="text"
              placeholder="State"
              required
              value={formData.address.state}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, state: e.target.value }
              })}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <input
              type="text"
              placeholder="Pincode"
              required
              value={formData.address.pincode}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, pincode: e.target.value }
              })}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {/* Custom Fields Section */}
        {customFields.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Fields</label>
            <div className="space-y-3">
              {customFields.map((field) => {
                const existingField = formData.customFields?.find(f => f.name === field.name);
                return (
                  <div key={field.id} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600">{field.name}</label>
                      <input
                        type={getInputType(field.fieldType)}
                        value={existingField?.value || ''}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Photo</label>
          <div className="mt-1 flex items-center space-x-4">
            {formData.photo && (
              <div className="relative w-24 h-24">
                <img
                  src={formData.photo}
                  alt="Member"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, photo: '' })}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
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
            {isEdit ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </form>

      {showCropper && photo && (
        <ImageCropper
          image={URL.createObjectURL(photo)}
          onCrop={handleCroppedImage}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}