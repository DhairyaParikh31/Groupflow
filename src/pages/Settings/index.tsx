import Layout from '../../components/Layout';
import PasswordSection from './PasswordSection';
import { useAuth } from '../../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
              <PasswordSection />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}