import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import BirthdayLists from './BirthdayLists';
import UpcomingEvents from './UpcomingEvents';
import DashboardStats from './DashboardStats';

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="space-y-6">
        {/* Stats Section */}
        <DashboardStats />
        
        {/* Upcoming Events Section */}
        <UpcomingEvents />

        {/* Birthday and Anniversary Lists */}
        <BirthdayLists />
      </div>
    </Layout>
  );
}