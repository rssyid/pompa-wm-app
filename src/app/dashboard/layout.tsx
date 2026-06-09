import { Navigation } from "@/components";
import { decrypt, SessionPayload } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  let user: SessionPayload | null = null;
  
  if (token) {
    user = await decrypt(token);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Top Navigation Client Component */}
      <Navigation user={user} />

      {/* Content */}
      <main className="max-w-[1400px] mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
