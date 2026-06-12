import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { session, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login" });
    else if (isAdmin) navigate({ to: "/admin" });
    else navigate({ to: "/inicio" });
  }, [loading, session, isAdmin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
      A redirecionar… <Link to="/login" className="ml-2 underline">Entrar</Link>
    </div>
  );
}
