export interface Member {
  id: string;
  name: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  anniversary?: string;
  maritalStatus: 'Single' | 'Married';
  leader: string;
  leaderName: string;
  area: string; // Added area field
  phoneNumber: string;
  email?: string;
  status: 'Active' | 'Moderate' | 'Inactive';
  photo?: string;
  customFields?: Array<{
    name: string;
    value: string;
  }>;
}

export interface CustomField {
  id: string;
  name: string;
  fieldType: 'text' | 'number' | 'date' | 'time' | 'email';
  defaultValue: string;
}