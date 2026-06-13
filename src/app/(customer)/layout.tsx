'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('bf_token');
    const role = localStorage.getItem('bf_role');
    
    if (!token) {
      router.push('/login');
    } else if (role !== 'customer' && pathname !== '/profile') {
      router.push('/staff-dashboard');
    } else {
      setAuthorized(true);
    }
  }, [router, pathname]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--sand-light)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-20">
        {children}
      </div>
    </>
  );
}
