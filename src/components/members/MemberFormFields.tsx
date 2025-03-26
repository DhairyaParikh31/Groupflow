import { Member } from '../../types/member';

interface MemberFormFieldsProps {
  formData: Partial<Member>;
  onChange: (field: string, value: any) => void;
  leaders: Array<{ id: string; name: string }>;
}

export default function MemberFormFields({ formData, onChange, leaders }: MemberFormFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          required
          value={formData.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {/* Add other form fields here */}
    </div>
  );
}