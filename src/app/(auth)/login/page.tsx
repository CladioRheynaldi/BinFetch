"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log("Trying to hit this URL:", `${process.env.NEXT_PUBLIC_API_URL}/auth/login`);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Welcome back! Your User ID is: ${data.userId}`);
        // Later, we will redirect to the dashboard here
      } else {
        setError(data.message || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setError('Cannot connect to the server. Is NestJS running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-600">Welcome Back</h1>
        
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}

        <div className="flex flex-col gap-4">
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to WasteApp? <Link href="/register" className="text-green-600 hover:underline">Create an account</Link>
        </p>
      </form>
    </div>
  );
}