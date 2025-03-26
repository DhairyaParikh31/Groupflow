import { useState, useCallback } from 'react';
import { Member } from '../types/member';
import { memberService } from '../services/memberService';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await memberService.getMembers();
      setMembers(data || []); // Ensure we always have an array
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = async (data: Partial<Member>) => {
    try {
      setLoading(true);
      setError(null);
      const newMember = await memberService.createMember(data);
      setMembers(prev => [...prev, newMember]);
      return newMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMember = async (id: string, data: Partial<Member>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedMember = await memberService.updateMember(id, data);
      setMembers(prev => prev.map(member => 
        member.id === id ? updatedMember : member
      ));
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await memberService.deleteMember(id);
      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    members,
    loading,
    error,
    fetchMembers,
    addMember,
    updateMember,
    deleteMember
  };
}