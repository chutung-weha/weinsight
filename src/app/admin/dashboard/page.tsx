import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  const [userCount, sessionCount, insightCount] = await Promise.all([
    prisma.user.count(),
    prisma.testSession.count({ where: { status: "COMPLETED" } }),
    prisma.aIInsight.count(),
  ]);

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-sm text-slate-400">
          Xin chào, {session?.user?.name || "Admin"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <StatCard label="Tổng người dùng" value={userCount} />
        <StatCard label="Bài test hoàn thành" value={sessionCount} />
        <StatCard label="AI Insights" value={insightCount} />
      </div>

      <div className="glass p-8 text-center">
        <p className="text-slate-400 text-sm">
          Các tính năng quản lý chi tiết (CRUD câu hỏi, cấu hình AI, upload tri thức) đang được phát triển.
        </p>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
