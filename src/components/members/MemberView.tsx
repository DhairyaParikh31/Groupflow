import { Member } from '../../types';

interface MemberViewProps {
  member: Member;
  onClose: () => void;
}

export default function MemberView({ member, onClose }: MemberViewProps) {
  // Format address object into a string
  const formatAddress = (address: Member['address']) => {
    return `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-bold">Member Details</h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Name</h3>
            <p className="mt-1">{member.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
            <p className="mt-1">{new Date(member.dateOfBirth).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
            <p className="mt-1">{member.phoneNumber}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1">{member.email || 'Not provided'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1">
              <span className={`px-2 py-1 rounded-full text-sm ${
                member.status === 'Active' ? 'bg-green-100 text-green-800' :
                member.status === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {member.status}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Leader's Name</h3>
            <p className="mt-1">{member.leaderName}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Marital Status</h3>
            <p className="mt-1">{member.maritalStatus}</p>
          </div>

          {member.maritalStatus === 'Married' && member.anniversary && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Anniversary</h3>
              <p className="mt-1">{new Date(member.anniversary).toLocaleDateString()}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500">Address</h3>
            <p className="mt-1">{formatAddress(member.address)}</p>
          </div>
        </div>
      </div>

      {/* Custom Fields Section */}
      {member.customFields && member.customFields.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Custom Fields</h3>
          <div className="grid grid-cols-2 gap-4">
            {member.customFields.map((field, index) => (
              <div key={index}>
                <h4 className="text-xs font-medium text-gray-500">{field.name}</h4>
                <p className="mt-1">{field.value || 'Not provided'}</p> </div>
            ))}
          </div>
        </div>
      )}

      {member.photo && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Photo</h3>
          <img
            src={member.photo}
            alt={member.name}
            className="w-32 h-32 object-cover rounded-lg"
          />
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}