import { Upload } from 'lucide-react';

interface UploadButtonProps {
  onClick: () => void;
}

export default function UploadButton({ onClick }: UploadButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
    >
      <Upload className="w-4 h-4" />
      <span>Share Information</span>
    </button>
  );
}