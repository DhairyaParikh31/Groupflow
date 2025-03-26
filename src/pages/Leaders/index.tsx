import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import LeaderForm from '../../components/leaders/LeaderForm';
import LeaderList from '../../components/leaders/LeaderList';
import LeaderView from '../../components/leaders/LeaderView';
import { Leader } from '../../types/leader';
import { leaderService } from '../../services/leaderService';
import { useAuth } from '../../contexts/AuthContext';

export default function Leaders() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | null>(null);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const data = await leaderService.getLeaders();
      // Ensure customFields is always an array
      const processedData = data.map(leader => ({
        ...leader,
        customFields: Array.isArray(leader.customFields) ? leader.customFields : []
      }));
      setLeaders(processedData);
    } catch (err) {
      console.error('Failed to fetch leaders:', err);
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeader = async (data: Partial<Leader>) => {
    try {
      const newLeader = await leaderService.createLeader(data);
      setLeaders(prev => [...prev, newLeader]);
      setModalType(null);
    } catch (error) {
      console.error('Failed to create leader:', error);
      throw error;
    }
  };

  const handleUpdateLeader = async (id: string, data: Partial<Leader>) => {
    try {
      const updatedLeader = await leaderService.updateLeader(id, data);
      setLeaders(prev => prev.map(leader => 
        leader.id === id ? updatedLeader : leader
      ));
      setModalType(null);
      setSelectedLeader(null);
    } catch (error) {
      console.error('Failed to update leader:', error);
      throw error;
    }
  };

  const handleDeleteLeader = async (id: string) => {
    try {
      await leaderService.deleteLeader(id);
      setLeaders(prev => prev.filter(leader => leader.id !== id));
    } catch (error) {
      console.error('Failed to delete leader:', error);
      throw error;
    }
  };

  if (loading) return <Layout><div className="p-8">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">List of Leaders</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setModalType('add')}
            className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Leader</span>
          </button>
        )}
      </div>

      {leaders.length > 0 ? (
        <LeaderList
          leaders={leaders}
          onView={(leader) => {
            setSelectedLeader(leader);
            setModalType('view');
          }}
          onEdit={(leader) => {
            if (user?.role === 'admin') {
              setSelectedLeader(leader);
              setModalType('edit');
            }
          }}
          onDelete={(leader) => {
            if (user?.role === 'admin') {
              handleDeleteLeader(leader.id);
            }
          }}
          isAdmin={user?.role === 'admin'}
        />
      ) : (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          No leaders found. {user?.role === 'admin' && 'Click "Add New Leader" to add one.'}
        </div>
      )}

      <Modal
        isOpen={modalType !== null}
        onClose={() => {
          setModalType(null);
          setSelectedLeader(null);
        }}
        title={
          modalType === 'add' ? 'Add New Leader' :
          modalType === 'edit' ? 'Edit Leader' :
          modalType === 'view' ? 'Leader Details' : ''
        }
      >
        {modalType === 'add' && user?.role === 'admin' && (
          <LeaderForm
            onSubmit={handleCreateLeader}
            onCancel={() => setModalType(null)}
          />
        )}
        {modalType === 'edit' && selectedLeader && user?.role === 'admin' && (
          <LeaderForm
            onSubmit={(data) => handleUpdateLeader(selectedLeader.id, data)}
            onCancel={() => {
              setModalType(null);
              setSelectedLeader(null);
            }}
            initialData={selectedLeader}
            isEdit
          />
        )}
        {modalType === 'view' && selectedLeader && (
          <LeaderView
            leader={selectedLeader}
            onClose={() => {
              setModalType(null);
              setSelectedLeader(null);
            }}
          />
        )}
      </Modal>
    </Layout>
  );
}