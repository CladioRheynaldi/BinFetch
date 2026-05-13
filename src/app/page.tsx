import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-bold mb-6 text-green-600">
          ♻️ WasteApp
        </h1>
        <p className="text-lg mb-8 text-gray-600">
          The easiest way to dispose of your waste. Request a pickup, track our staff, and earn rewards for recycling!
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row justify-center">
          <Link 
            href="/login" 
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-md"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="px-8 py-3 bg-gray-200 text-green-800 rounded-lg font-bold hover:bg-gray-300 transition shadow-md"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}