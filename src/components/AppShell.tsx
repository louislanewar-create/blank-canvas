import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import type { ReactNode } from "react";

const daysUntil = (d?: string | null) => {
  if (!d) return null;
  return Math.floor((new Date(d).getTime() - Date.now()) / 86400000);
};

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: alertCount = 0 } = useQuery({
    queryKey: ["alert-count", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("documentos").select("status, data_validade").eq("user_id", user!.id);
      if (!data) return 0;
      return data.filter((d) => {
        if (d.status === "reprovado" || d.status === "correcao_solicitada") return true;
        const days = daysUntil(d.data_validade);
        return days !== null && days <= 30;
      }).length;
    },
    enabled: !!user && !isAdmin,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <div className="h-6 w-6 bg-primary" />
            <span>COLABORADORES</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 hover:bg-muted rounded-md flex items-center gap-1.5"
                activeProps={{ className: "px-3 py-1.5 bg-muted rounded-md flex items-center gap-1.5 font-semibold" }}
              >
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
            {!isAdmin && (
              <Link
                to="/avisos"
                className="px-3 py-1.5 hover:bg-muted rounded-md flex items-center gap-1.5 relative"
                activeProps={{ className: "px-3 py-1.5 bg-muted rounded-md flex items-center gap-1.5 font-semibold relative" }}
              >
                <Bell className="h-4 w-4" /> Avisos
                {alertCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center text-[10px] font-bold h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground">
                    {alertCount}
                  </span>
                )}
              </Link>
            )}
            <Link
              to="/"
              className="px-3 py-1.5 hover:bg-muted rounded-md flex items-center gap-1.5"
            >
              <UserIcon className="h-4 w-4" /> {user?.email}
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Sair
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
