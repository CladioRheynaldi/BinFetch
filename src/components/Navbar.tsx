'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('bf_role'));
    }
  }, [pathname]);

  
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  
  const isStaff = 
    role === 'staff' || 
    pathname?.startsWith('/staff') || 
    pathname === '/staff-dashboard' || 
    pathname?.startsWith('/complete-pickup') || 
    pathname?.startsWith('/pickups') || 
    pathname?.startsWith('/manage');

  
  const navBg = isStaff 
    ? 'bg-[#faf4e8] border-b-2 border-emerald-600/20 shadow-sm' 
    : 'bg-[#faf6eb] border-b border-green-900/10 shadow-sm';
  
  const textClass = isStaff 
    ? 'text-slate-700 hover:text-emerald-700' 
    : 'text-green-950 hover:text-[var(--green-mid)]';
  
  const activeClass = isStaff 
    ? 'text-emerald-700 border-b-2 border-emerald-600' 
    : 'text-[var(--green-mid)] border-b-2 border-[var(--green-mid)]';
  
  const linkContainerClass = isStaff ? 'text-slate-800' : 'text-green-950';
  const profileBorder = isStaff ? 'border-emerald-600' : 'border-green-950';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${navBg}`}>
      <div className="w-full flex justify-between items-center px-6 md:px-12 py-4">
        
        {}
        {isStaff ? (
          <Link 
            href="/staff-dashboard" 
            className="text-3xl font-bold text-slate-800 flex-shrink-0 hover:opacity-90 transition font-display flex items-center gap-2"
          >
            BinFetch
            <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded shadow-sm font-sans tracking-wide uppercase">
              Staff Portal
            </span>
          </Link>
        ) : (
          <Link 
            href="/customer-dashboard" 
            className="text-3xl font-bold text-green-950 flex-shrink-0 hover:opacity-90 transition font-display flex items-center gap-2"
          >
            BinFetch
            <span className="text-xs bg-green-700/10 text-green-700 font-bold px-2 py-0.5 rounded border border-green-700/20 font-sans tracking-wide uppercase">
              Customer
            </span>
          </Link>
        )}

        {}
        <div className="flex items-center gap-6 md:gap-8">
          
          {}
          <div className={`flex items-center gap-4 md:gap-8 text-sm md:text-base font-semibold ${linkContainerClass}`}>
            {isStaff ? (
              <>
                <Link
                  href="/staff-dashboard"
                  className={`transition ${
                    pathname === '/staff-dashboard' ? activeClass : textClass
                  }`}
                >
                  Home
                </Link>

                <Link
                  href="/pickups"
                  className={`transition ${
                    pathname?.startsWith('/pickups') ? activeClass : textClass
                  }`}
                >
                  Pickups
                </Link>

                <Link
                  href="/manage"
                  className={`transition ${
                    pathname?.startsWith('/manage') ? activeClass : textClass
                  }`}
                >
                  Operations
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/customer-dashboard"
                  className={`transition ${
                    pathname === '/customer-dashboard' ? activeClass : textClass
                  }`}
                >
                  Home
                </Link>

                <Link
                  href="/request-pickup"
                  className={`transition ${
                    pathname === '/request-pickup' ? activeClass : textClass
                  }`}
                >
                  Request
                </Link>

                <Link
                  href="/my-request"
                  className={`transition ${
                    pathname === '/my-request' ? activeClass : textClass
                  }`}
                >
                  History
                </Link>

                <Link
                  href="/reward"
                  className={`transition ${
                    pathname === '/reward' ? activeClass : textClass
                  }`}
                >
                  Rewards
                </Link>

                <Link
                  href="/exchange"
                  className={`transition ${
                    pathname === '/exchange' ? activeClass : textClass
                  }`}
                >
                  Exchange
                </Link>
              </>
            )}
          </div>

          {}
          <Link href="/profile" title="View Profile">
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 bg-cover bg-center hover:scale-105 transition flex-shrink-0 ${profileBorder}`}
              style={{
                backgroundImage: "url('/profile_pic.png')",
              }}
            />
          </Link>

        </div>
      </div>
    </nav>
  );
}