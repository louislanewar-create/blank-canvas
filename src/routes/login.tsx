import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "sonner";

const emailFromNif = (value: string) => `nif-${value}@placeholder.local`;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [nif, setNif] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: signIn, error } = await supabase.auth.signInWithPassword({
        email: emailFromNif(nif.trim()),
        password,
      });
      if (error) {
        toast.error("Credenciais inválidas.");
        return;
      }
      // Force password change on first access
      const { data: prof } = await supabase
        .from("profiles")
        .select("must_change_password")
        .eq("id", signIn.user!.id)
        .maybeSingle();
      if (prof?.must_change_password) {
        toast.info("Defina uma nova palavra-passe para continuar.");
        navigate({ to: "/reset-password" });
        return;
      }
      toast.success("Bem-vindo!");
      navigate({ to: "/" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Entrar" subtitle="Acesse a sua conta com NIF e senha">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nif">NIF</Label>
          <Input id="nif" required value={nif} onChange={(e) => setNif(e.target.value)} maxLength={20} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw">Senha</Label>
          <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "A entrar…" : "Entrar"}
        </Button>
        <div className="flex justify-between text-xs pt-2">
          <Link to="/primeiro-acesso" className="hover:underline">Primeiro acesso</Link>
          <Link to="/esqueci-senha" className="hover:underline">Esqueci a senha</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
