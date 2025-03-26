import { X } from 'lucide-react';
import { resizeAndCropImage } from '../../utils/imageUtils';

interface PhotoUploadProps {
  photo?: string;
  onPhotoChange: (photo: string) => void;
  onPhotoRemove: () => void;
}

export default function PhotoUpload({ photo, onPhotoChange, onPhotoRemove }: PhotoUploadProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const resizedPhoto = await resizeAndCropImage(e.target.files[0], 400, 400);
        onPhotoChange(resizedPhoto);
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Photo</label>
      <div className="mt-1 flex items-center space-x-4">
        {photo && (
          <div className="relative w-24 h-24">
            <img
              src={photo}
              alt="Member"
              className="w-24 h-24 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={onPhotoRemove}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
    </div>
  );
}