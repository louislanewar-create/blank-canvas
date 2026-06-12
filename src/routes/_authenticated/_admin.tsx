import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/_admin")({
  component: AdminGuard,
});

function AdminGuard() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/" });
  }, [loading, isAdmin, navigate]);
  if (loading) return <div className="p-10 text-sm text-muted-foreground">A carregar…</div>;
  if (!isAdmin) return null;
  return <Outlet />;
}
