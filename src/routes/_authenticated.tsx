import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  // Block all routes until first-access flow is complete
  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("must_change_password")
        .eq("id", session.user.id)
        .maybeSingle();
      if (data?.must_change_password && location.pathname !== "/reset-password") {
        navigate({ to: "/reset-password" });
      }
      setChecking(false);
    })();
  }, [session, location.pathname, navigate]);

  if (loading || !session || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        A carregar…
      </div>
    );
  }
  return <AppShell><Outlet /></AppShell>;
}
