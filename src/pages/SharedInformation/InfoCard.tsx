import { useState } from 'react';
import { Pencil, Trash2, FileText, Image, Film, Music, File, Download } from 'lucide-react';
import { SharedInfo } from './types';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/Modal';

interface InfoCardProps {
  info: SharedInfo;
  onEdit: (info: SharedInfo) => void;
  onDelete: (id: string) => void;
}

export default function InfoCard({ info, onEdit, onDelete }: InfoCardProps) {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (contentType.startsWith('video/')) {
      return <Film className="w-5 h-5" />;
    } else if (contentType.startsWith('audio/')) {
      return <Music className="w-5 h-5" />;
    } else if (contentType.includes('pdf')) {
      return <FileText className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const canModify = user?.role === 'admin' || user?.name === info.createdBy;

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <div className="flex flex-col space-y-4">
          {/* Title and Action Buttons */}
          <div className="flex items-start justify-between w-full">
            <h3 className="font-semibold text-lg flex-1 break-words pr-4">{info.title}</h3>
            {canModify && (
              <div className="flex-shrink-0 flex space-x-2">
                <button 
                  onClick={() => onEdit(info)} 
                  className="p-1 hover:text-blue-600"
                  title="Edit information"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="p-1 hover:text-red-600"
                  title="Delete information"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="text-gray-600 whitespace-pre-line break-words">
            {info.content}
          </div>
          
          {/* Attachments */}
          {info.attachments && info.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Attachments</h4>
              <div className="space-y-2">
                {info.attachments.map((attachment) => (
                  <a 
                    key={attachment.id}
                    href={`/api/shared-info/attachment/${info.id}/${attachment.id}`}
                    download={attachment.filename}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 group break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="flex-shrink-0">
                      {getFileIcon(attachment.contentType)}
                    </span>
                    <span className="text-sm truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                      {attachment.filename}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      ({formatFileSize(attachment.size)})
                    </span>
                    <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* Footer Info */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
            <span className="break-words">Shared by {info.createdBy}</span>
            <span>•</span>
            <span>{formatDate(info.createdAt)}</span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Deletion"
      >
        <div className="p-6">
          <p className="mb-4">Are you sure you want to delete this shared information? This action cannot be undone.</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDelete(info.id);
                setShowDeleteConfirm(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}