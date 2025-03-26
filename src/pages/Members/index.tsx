import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import MemberList from '../../components/members/MemberList';
import MemberForm from '../../components/members/MemberForm';
import MemberView from '../../components/members/MemberView';
import CustomFieldsManager from './CustomFieldsManager';
import { Member } from '../../types';
import { memberService } from '../../services/memberService';
import { useAuth } from '../../contexts/AuthContext';

export default function Members() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaders, setLeaders] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | null>(null);

  useEffect(() => {
    fetchMembers();
    if (user?.role === 'admin') {
      fetchLeaders();
    }
  }, [user]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMembers();
      const filteredMembers = user?.role === 'leader'
        ? data.filter(member => member.leader === user.id)
        : data;
      setMembers(filteredMembers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaders = async () => {
    try {
      const response = await fetch('/api/members/leaders');
      if (!response.ok) {
        throw new Error('Failed to fetch leaders');
      }
      const data = await response.json();
      setLeaders(data);
    } catch (error) {
      console.error('Failed to fetch leaders:', error);
      setError('Failed to fetch leaders');
    }
  };

  const handleAddMember = async (data: Partial<Member>) => {
    try {
      const memberData = user?.role === 'leader'
        ? { ...data, leader: user.id }
        : data;
      
      const newMember = await memberService.createMember(memberData);
      setMembers(prev => [...prev, newMember]);
      setModalType(null);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateMember = async (id: string, data: Partial<Member>) => {
    try {
      if (user?.role === 'leader') {
        const member = members.find(m => m.id === id);
        if (member?.leader !== user.id) {
          throw new Error('You can only update your own members');
        }
      }

      const updatedMember = await memberService.updateMember(id, data);
      setMembers(prev => prev.map(member => 
        member.id === id ? updatedMember : member
      ));
      setModalType(null);
      setSelectedMember(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      if (user?.role === 'leader') {
        const member = members.find(m => m.id === memberId);
        if (member?.leader !== user.id) {
          throw new Error('You can only delete your own members');
        }
      }

      await memberService.deleteMember(memberId);
      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      console.error('Failed to delete member:', error);
      setError('Failed to delete member');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading members...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          {user?.role === 'leader' ? 'My Members' : 'List of Members'}
        </h1>
        <button
          onClick={() => setModalType('add')}
          className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 w-full sm:w-auto justify-center sm:justify-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="mb-6">
          <CustomFieldsManager />
        </div>
      )}

      {members.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <MemberList
            members={members}
            onView={(member) => {
              setSelectedMember(member);
              setModalType('view');
            }}
            onEdit={(member) => {
              if (user?.role === 'admin' || member.leader === user?.id) {
                setSelectedMember(member);
                setModalType('edit');
              }
            }}
            onDelete={(member) => {
              if (user?.role === 'admin' || member.leader === user?.id) {
                handleDeleteMember(member.id);
              }
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 mt-6">
          No members found. Click "Add New Member" to add one.
        </div>
      )}

      <Modal
        isOpen={modalType !== null}
        onClose={() => {
          setModalType(null);
          setSelectedMember(null);
        }}
        title={
          modalType === 'add' ? 'Add Member' :
          modalType === 'edit' ? 'Edit Member' :
          modalType === 'view' ? 'Member Details' : ''
        }
      >
        <div className="max-h-[80vh] overflow-y-auto">
          {modalType === 'add' && (
            <MemberForm
              onSubmit={handleAddMember}
              onCancel={() => setModalType(null)}
              leaders={user?.role === 'admin' ? leaders : [{ id: user?.id || '', name: user?.name || '' }]}
            />
          )}
          {modalType === 'edit' && selectedMember && (
            <MemberForm
              onSubmit={(data) => handleUpdateMember(selectedMember.id, data)}
              onCancel={() => {
                setModalType(null);
                setSelectedMember(null);
              }}
              initialData={selectedMember}
              leaders={user?.role === 'admin' ? leaders : [{ id: user?.id || '', name: user?.name || '' }]}
              isEdit
            />
          )}
          {modalType === 'view' && selectedMember && (
            <MemberView
              member={selectedMember}
              onClose={() => {
                setModalType(null);
                setSelectedMember(null);
              }}
            />
          )}
        </div>
      </Modal>
    </Layout>
  );
}