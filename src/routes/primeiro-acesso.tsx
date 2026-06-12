import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/primeiro-acesso")({
  component: SignupPage,
});

function SignupPage() {
  const [nif, setNif] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const { data: existing } = await supabase.rpc("lookup_email_by_nif", { _nif: nif.trim() });
      if (existing) {
        toast.error("Este NIF já está cadastrado.");
        return;
      }
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { nif: nif.trim() },
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Conta criada! Verifique seu e-mail para ativar o acesso.");
      navigate({ to: "/login" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Primeiro acesso" subtitle="Crie a sua conta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nif">NIF</Label>
          <Input id="nif" required value={nif} onChange={(e) => setNif(e.target.value)} maxLength={20} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw">Senha</Label>
          <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "A criar…" : "Criar conta"}
        </Button>
        <div className="text-xs text-center pt-2">
          <Link to="/login" className="hover:underline">Já tenho conta</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
