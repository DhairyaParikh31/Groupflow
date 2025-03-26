import { Eye, Pencil, Trash2, Users2 } from 'lucide-react';
import { Leader } from '../../types/leader';

interface LeaderListProps {
  leaders: Leader[];
  onView: (leader: Leader) => void;
  onEdit: (leader: Leader) => void;
  onDelete: (leader: Leader) => void;
  isAdmin: boolean;
}

export default function LeaderList({ leaders, onView, onEdit, onDelete, isAdmin }: LeaderListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Desktop view */}
      <div className="hidden md:block">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left">Leader's Name</th>
              <th className="px-6 py-3 text-left">Area</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Members</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((leader) => (
              <tr key={leader.id} className="border-b">
                <td className="px-6 py-4 flex items-center space-x-3">
                  {leader.photo ? (
                    <img src={leader.photo} alt={leader.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <Users2 className="w-8 h-8 text-gray-400" />
                  )}
                  <span>{leader.name}</span>
                </td>
                <td className="px-6 py-4">{leader.area}</td>
                <td className="px-6 py-4">{leader.email}</td>
                <td className="px-6 py-4">{leader.phoneNumber}</td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${
                    leader.activeMembers === 0 ? 'text-gray-500' : 'text-green-600'
                  }`}>
                    {leader.activeMembers}/{leader.totalMembers}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(leader)}
                      className="p-1 hover:text-blue-600"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit(leader)}
                          className="p-1 hover:text-blue-600"
                          title="Edit leader"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDelete(leader)}
                          className="p-1 hover:text-red-600"
                          title="Delete leader"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {leaders.map((leader) => (
          <div key={leader.id} className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {leader.photo ? (
                  <img src={leader.photo} alt={leader.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <Users2 className="w-10 h-10 text-gray-400" />
                )}
                <div>
                  <h3 className="font-medium">{leader.name}</h3>
                  <p className="text-sm text-gray-500">{leader.area}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onView(leader)}
                  className="p-2 hover:text-blue-600"
                  title="View details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => onEdit(leader)}
                      className="p-2 hover:text-blue-600"
                      title="Edit leader"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(leader)}
                      className="p-2 hover:text-red-600"
                      title="Delete leader"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="truncate">{leader.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p>{leader.phoneNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Members</p>
                <p className={leader.activeMembers === 0 ? 'text-gray-500' : 'text-green-600'}>
                  {leader.activeMembers}/{leader.totalMembers}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}