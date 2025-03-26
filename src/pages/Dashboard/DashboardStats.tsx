import { Users, Calendar, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    upcomingEvents: 0,
    sharedInfo: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch members count
        const membersResponse = await fetch('/api/members', {
          credentials: 'include'
        });
        const membersData = await membersResponse.json();
        
        // Fetch events
        const eventsResponse = await fetch('/api/events', {
          credentials: 'include'
        });
        const eventsData = await eventsResponse.json();
        
        // Fetch shared information
        const sharedInfoResponse = await fetch('/api/shared-info', {
          credentials: 'include'
        });
        const sharedInfoData = await sharedInfoResponse.json();
        
        // Calculate upcoming events for current month only
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const currentMonthEvents = eventsData.filter((event) => {
          const eventDate = new Date(event.date);
          return (
            eventDate.getMonth() === currentMonth && 
            eventDate.getFullYear() === currentYear &&
            eventDate >= currentDate
          );
        });
        
        // Update stats
        setStats({
          totalMembers: membersData.length || 0,
          upcomingEvents: currentMonthEvents.length || 0,
          sharedInfo: sharedInfoData.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <StatCard
        icon={<Users className="w-6 h-6 sm:w-8 sm:h-8" />}
        title="Total Members"
        value={loading ? "Loading..." : stats.totalMembers.toString()}
      />
      <StatCard
        icon={<Calendar className="w-6 h-6 sm:w-8 sm:h-8" />}
        title={`${new Date().toLocaleString('default', { month: 'long' })} Events`}
        value={loading ? "Loading..." : stats.upcomingEvents.toString()}
      />
      <StatCard
        icon={<FileText className="w-6 h-6 sm:w-8 sm:h-8" />}
        title="Shared Information"
        value={loading ? "Loading..." : stats.sharedInfo.toString()}
      />
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 md:space-x-4">
        <div className="text-gray-600">{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-xl md:text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}