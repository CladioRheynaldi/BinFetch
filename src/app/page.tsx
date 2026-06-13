import Link from "next/link";

export default function Home() {
  return (
    <>
      <main
        className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "url('/frontpage_bg.png')",
        }}
      >

        {}
        <div className="max-w-md text-center px-6">
          <h1 className="text-5xl font-bold mb-6 text-[var(--green-darkest)]">
            BinFetch
          </h1>
          <p className="text-lg mb-8 font-bold text-[var(--ink-black)]">
            The easiest way to dispose of your waste.
            Request a pickup, track our staff, and earn
            rewards for recycling!
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Link 
              href="/login" 
              className="px-8 py-3 bg-[var(--green-mid)] text-white rounded-lg font-bold hover:bg-[var(--green-dark)] transition shadow-md"
            >
              Login
            </Link>

            <Link 
              href="/register" 
              className="px-8 py-3 bg-[var(--green-darkest)] text-[var(--green-mid)] rounded-lg font-bold hover:bg-gray-300 transition shadow-md"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}