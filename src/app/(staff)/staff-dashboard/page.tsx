import ActionCard from "@/components/shared/ActionCard";
import StaffRecentAssignments from "@/components/dashboard/StaffRecentAssignments";

export default function StaffDashboardPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero Section */}
      <section className="mb-10">
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Staff Portal
        </span>

        <h1 className="font-display mt-4 text-5xl font-semibold text-[color:var(--green-950)]">
          Operations Center ♻️
        </h1>

        <p className="mt-3 max-w-2xl text-lg text-[color:var(--ink-700)]">
          Manage pickup assignments, monitor customer requests,
          and keep recycling operations running smoothly.
        </p>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="auth-card rounded-3xl p-6">
          <p className="text-sm text-gray-500">Assigned Pickups</p>
          <h2 className="mt-2 text-4xl font-bold text-green-800">12</h2>
        </div>

        <div className="auth-card rounded-3xl p-6">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <h2 className="mt-2 text-4xl font-bold text-amber-600">5</h2>
        </div>

        <div className="auth-card rounded-3xl p-6">
          <p className="text-sm text-gray-500">Completed Today</p>
          <h2 className="mt-2 text-4xl font-bold text-emerald-600">18</h2>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-10">
        <h2 className="font-display mb-6 text-3xl font-semibold text-[color:var(--green-950)]">
          Quick Actions
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <ActionCard
            href="/staff/pickups"
            title="Pickup Requests"
            description="Review and manage assigned pickups."
          />

          <ActionCard
            href="/staff/history"
            title="Pickup History"
            description="View completed pickup records."
          />

          <ActionCard
            href="/staff/rewards"
            title="Rewards Monitoring"
            description="Track customer reward activities."
          />
        </div>
      </section>

      {/* Recent Work */}
      <section className="auth-card rounded-3xl p-8">
        <h2 className="font-display text-3xl font-semibold text-[color:var(--green-950)] mb-6">
          Recent Assignments
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-green-100 pb-4">
            <div>
              <p className="font-semibold">Plastic Waste Pickup</p>
              <p className="text-sm text-gray-500">
                Customer Request #1024
              </p>
            </div>

            <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700">
              Pending
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-green-100 pb-4">
            <div>
              <p className="font-semibold">Paper Waste Collection</p>
              <p className="text-sm text-gray-500">
                Customer Request #1025
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              Processing
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Metal Waste Pickup</p>
              <p className="text-sm text-gray-500">
                Customer Request #1026
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
              Completed
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}