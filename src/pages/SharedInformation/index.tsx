import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import InfoCard from './InfoCard';
import UploadButton from './UploadButton';
import Modal from '../../components/Modal';
import InfoForm from './InfoForm';
import { SharedInfo } from './types';
import { sharedInfoService } from '../../services/sharedInfoService';

export default function SharedInformation() {
  const [sharedInfo, setSharedInfo] = useState<SharedInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<SharedInfo | null>(null);

  useEffect(() => {
    fetchSharedInfo();
  }, []);

  const fetchSharedInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sharedInfoService.getSharedInfo();
      setSharedInfo(data);
    } catch (err) {
      console.error('Failed to fetch shared information:', err);
      setError('Failed to fetch shared information');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInfo = async (formData: FormData) => {
    try {
      const newInfo = await sharedInfoService.createSharedInfo(formData);
      setSharedInfo(prev => [newInfo, ...prev]);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create shared information:', err);
      throw err;
    }
  };

  const handleUpdateInfo = async (formData: FormData) => {
    if (!selectedInfo) return;
    
    try {
      const updatedInfo = await sharedInfoService.updateSharedInfo(selectedInfo.id, formData);
      setSharedInfo(prev => prev.map(info => 
        info.id === updatedInfo.id ? updatedInfo : info
      ));
      setSelectedInfo(null);
    } catch (err) {
      console.error('Failed to update shared information:', err);
      throw err;
    }
  };

  const handleDeleteInfo = async (id: string) => {
    try {
      await sharedInfoService.deleteSharedInfo(id);
      setSharedInfo(prev => prev.filter(info => info.id !== id));
    } catch (err) {
      console.error('Failed to delete shared information:', err);
      setError('Failed to delete shared information');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Shared Information</h1>
          <UploadButton onClick={() => setShowForm(true)} />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading shared information...</p>
            </div>
          </div>
        ) : sharedInfo.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            <p className="mb-4">No shared information found.</p>
            <p className="text-sm">Click "Share Information" to add some.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {sharedInfo.map((info) => (
              <InfoCard 
                key={info.id} 
                info={info} 
                onEdit={(info) => setSelectedInfo(info)}
                onDelete={handleDeleteInfo}
              />
            ))}
          </div>
        )}

        <Modal
          isOpen={showForm || selectedInfo !== null}
          onClose={() => {
            setShowForm(false);
            setSelectedInfo(null);
          }}
          title={selectedInfo ? 'Edit Shared Information' : 'Share New Information'}
        >
          <InfoForm
            onSubmit={selectedInfo ? handleUpdateInfo : handleCreateInfo}
            onCancel={() => {
              setShowForm(false);
              setSelectedInfo(null);
            }}
            initialData={selectedInfo || undefined}
          />
        </Modal>
      </div>
    </Layout>
  );
}