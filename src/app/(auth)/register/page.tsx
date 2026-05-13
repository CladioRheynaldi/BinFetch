"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Registration Success! Please login.');
        router.push('/login'); // Redirect to login page
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Cannot connect to the server. Is NestJS running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-600">Create Account</h1>
        
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}

        <div className="flex flex-col gap-4">
          <input 
            type="text" placeholder="Full Name" required
            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => setFullName(e.target.value)}
          />
          <input 
            type="email" placeholder="Email Address" required
            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required
            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-green-600 text-white font-bold p-3 rounded mt-2 hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-green-600 hover:underline">Login here</Link>
        </p>
      </form>
    </div>
  );
}