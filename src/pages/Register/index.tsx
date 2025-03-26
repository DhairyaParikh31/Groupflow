import { Link } from 'react-router-dom';
import RegisterForm from './RegisterForm';

export default function Register() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-8">Create Account</h1>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-black hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}