import { Activity } from 'lucide-react';

export default function RecentActivity() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        <ActivityItem
          title="New Member Added"
          description="John Doe was added by Leader Smith"
          time="2 hours ago"
        />
        <ActivityItem
          title="Event Created"
          description="Monthly Meeting scheduled for next week"
          time="5 hours ago"
        />
        <ActivityItem
          title="Information Shared"
          description="New guidelines uploaded"
          time="1 day ago"
        />
      </div>
    </div>
  );
}

function ActivityItem({ title, description, time }: { title: string; description: string; time: string }) {
  return (
    <div className="flex items-start space-x-3">
      <Activity className="w-5 h-5 text-gray-400 mt-1" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
}