import { Leader } from '../../types/leader';

interface LeaderViewProps {
  leader: Leader;
  onClose: () => void;
}

export default function LeaderView({ leader, onClose }: LeaderViewProps) {
  return (
    <div className="p-4 md:p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">{leader.name}</h2>
          <p className="text-sm text-gray-600">
            Active: {leader.activeMembers} / Total: {leader.totalMembers}
          </p>
        </div>
      </div>

      {/* Custom Fields Section - Displayed prominently at the top */}
      {leader.customFields && leader.customFields.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Custom Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leader.customFields.map((field, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-50">
                <h4 className="text-sm font-medium text-gray-600">{field.name}</h4>
                <p className="mt-1 text-gray-900 font-medium break-words">
                  {field.value || 'Not provided'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
            <p className="mt-1 text-gray-900">{new Date(leader.dateOfBirth).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
            <p className="mt-1 text-gray-900">{leader.phoneNumber}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1 text-gray-900 break-words">{leader.email}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Area</h3>
            <p className="mt-1 text-gray-900">{leader.area}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Marital Status</h3>
            <p className="mt-1 text-gray-900">{leader.maritalStatus}</p>
          </div>

          {leader.maritalStatus === 'Married' && leader.anniversary && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Anniversary</h3>
              <p className="mt-1 text-gray-900">{new Date(leader.anniversary).toLocaleDateString()}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500">Address</h3>
            <p className="mt-1 text-gray-900 break-words">
              {leader.address.street}, {leader.address.city}, {leader.address.state} - {leader.address.pincode}
            </p>
          </div>
        </div>
      </div>

      {leader.photo && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Photo</h3>
          <img
            src={leader.photo}
            alt={leader.name}
            className="w-32 h-32 object-cover rounded-lg shadow-md"
          />
        </div>
      )}

      <div className="mt-6 flex justify-end sticky bottom-0 bg-white py-4">
        <button
          onClick={onClose}
          className="w-full md:w-auto px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}