import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  // Yêu cầu user object có id rõ ràng. NextAuth có thể trả session.user = {...}
  // chỉ với name/email/image (không có id) nếu token bị invalidate → ta coi
  // như null để caller check `if (!user)` hoạt động đúng.
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/dang-nhap");
  }
  return user;
}

export async function requireRole(roles: string[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect("/");
  }
  return user;
}
