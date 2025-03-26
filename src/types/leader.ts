export interface Leader {
  id: string;
  name: string;
  email: string;
  area: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  anniversary?: string;
  maritalStatus: 'Single' | 'Married';
  phoneNumber: string;
  photo?: string;
  activeMembers: number;
  totalMembers: number;
  userId: string;
  customFields: Array<{
    name: string;
    value: string;
  }>;
}