import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-[var(--sand-mid)] shadow-md z-50">

      <div className="w-full flex justify-between items-center px-12 py-4">

        {/* Left Side - Logo */}
        <div className="text-3xl font-bold text-black flex-shrink-0">
          BinFetch
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-8">
          {/* Navigation Links */}
          <div className="flex justify-between w-[300px] text-base font-semibold text-black">
            <Link
              href="/customer-dashboard"
              className="hover:text-[var(--green-mid)] transition"
            >
              Home
            </Link>

            <Link
              href="/request-pickup"
              className="hover:text-[var(--green-mid)] transition"
            >
              Request
            </Link>

            <Link
              href="/reward"
              className="hover:text-[var(--green-mid)] transition"
            >
              Rewards
            </Link>

            <Link
              href="/exchange"
              className="hover:text-[var(--green-mid)] transition"
            >
              Exchange
            </Link>
          </div>

          {/* Profile Image */}
            <Link href="/profile">
                <div
                    className="w-12 h-12 rounded-full border-2 border-black bg-cover bg-center hover:scale-105 transition flex-shrink-0"
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