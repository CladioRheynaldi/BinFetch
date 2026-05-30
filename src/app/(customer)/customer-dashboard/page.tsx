import ActionCard from "@/components/shared/ActionCard";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function CustomerDashboardPage() {
  return (
    <main className="max-w-7xl mx-auto p-6">

      {/* Hero Section */}
      <section className="auth-card auth-grid rounded-[32px] p-10 mb-8">
        <p className="uppercase tracking-[0.3em] text-sm text-green-700">
          CLEAN LIVING
        </p>

        <h1 className="font-display text-5xl md:text-6xl font-bold text-green-950 mt-4">
          Welcome Back to BinFetch
        </h1>

        <p className="text-lg text-gray-600 mt-4 max-w-3xl">
          Manage pickup requests, track rewards, and contribute to a cleaner
          environment while earning points for every recycling activity.
        </p>
      </section>

      {/* Stats Section */}
      <section className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="auth-card rounded-3xl p-6">
          <p className="text-gray-500 mb-2">
            Reward Points
          </p>

          <h2 className="text-4xl font-bold text-green-700">
            1,250
          </h2>
        </div>

        <div className="auth-card rounded-3xl p-6">
          <p className="text-gray-500 mb-2">
            Active Requests
          </p>

          <h2 className="text-4xl font-bold text-green-700">
            3
          </h2>
        </div>

        <div className="auth-card rounded-3xl p-6">
          <p className="text-gray-500 mb-2">
            Completed Pickups
          </p>

          <h2 className="text-4xl font-bold text-green-700">
            12
          </h2>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="font-display text-3xl font-bold text-green-950 mb-6">
          Quick Actions
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <ActionCard
            href="/request-pickup"
            title="♻️ Create Request"
            description="Schedule a new waste pickup request."
          />

          <ActionCard
            href="/my-request"
            title="📋 My Requests"
            description="Track and manage your pickup history."
          />

          <ActionCard
            href="/reward"
            title="🎁 Rewards"
            description="Redeem your points for exciting rewards."
          />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="auth-card rounded-3xl p-8">
        <h2 className="font-display text-3xl font-bold text-green-950 mb-6">
          Recent Activity
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-green-100 pb-4">
            <div>
              <p className="font-semibold">
                Pickup Request #001
              </p>

              <p className="text-sm text-gray-500">
                Plastic Waste Collection
              </p>
            </div>

            <span className="rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-medium">
              Completed
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-green-100 pb-4">
            <div>
              <p className="font-semibold">
                Pickup Request #002
              </p>

              <p className="text-sm text-gray-500">
                Paper Recycling
              </p>
            </div>

            <span className="rounded-full bg-yellow-100 text-yellow-700 px-4 py-2 text-sm font-medium">
              Pending
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                Reward Redemption
              </p>

              <p className="text-sm text-gray-500">
                Eco Shopping Voucher
              </p>
            </div>

            <span className="rounded-full bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium">
              Redeemed
            </span>
          </div>
        </div>
      </section>

    </main>
  );
}
<RecentActivity />

