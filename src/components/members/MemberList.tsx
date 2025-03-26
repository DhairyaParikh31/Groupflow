import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Member } from '../../types';

interface MemberListProps {
  members: Member[];
  onView: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export default function MemberList({ members, onView, onEdit, onDelete }: MemberListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Desktop view */}
      <div className="hidden md:block">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left">Member's Name</th>
              <th className="px-6 py-3 text-left">Area</th>
              <th className="px-6 py-3 text-left">Leader Name</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b">
                <td className="px-6 py-4 flex items-center space-x-3">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  )}
                  <span>{member.name}</span>
                </td>
                <td className="px-6 py-4">{member.area}</td>
                <td className="px-6 py-4">{member.leaderName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    member.status === 'Active' ? 'bg-green-100 text-green-800' :
                    member.status === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(member)}
                      className="p-1 hover:text-blue-600"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onEdit(member)}
                      className="p-1 hover:text-blue-600"
                      title="Edit member"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(member)}
                      className="p-1 hover:text-red-600"
                      title="Delete member"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {members.map((member) => (
          <div key={member.id} className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                )}
                <div>
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.area}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                member.status === 'Active' ? 'bg-green-100 text-green-800' :
                member.status === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {member.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Leader: {member.leaderName}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => onView(member)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="View details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onEdit(member)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Edit member"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(member)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Delete member"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}