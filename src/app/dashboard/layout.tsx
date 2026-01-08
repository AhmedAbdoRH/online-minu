import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/common/Header";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { cn } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background relative overflow-x-hidden">
      {catalog && <DashboardNav user={user} catalog={catalog} />}
      <div className={cn(
        "flex flex-col flex-1 w-full",
        catalog ? "sm:gap-4 sm:py-4 sm:pr-14 pb-24 sm:pb-0" : "items-center justify-center min-h-[100dvh]"
      )}>
        <main className={cn(
          "grid flex-1 items-start gap-4 md:gap-8",
          catalog ? "p-4 sm:px-6 sm:py-0" : "w-full animate-in fade-in duration-1000"
        )}>
          {children}
        </main>
      </div>
      {catalog && <BottomNav />}
    </div>
  );
}
