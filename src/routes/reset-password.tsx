import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPage,
});

function ResetPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mustChange, setMustChange] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("must_change_password, recovery_email")
        .eq("id", data.user.id)
        .maybeSingle();
      setMustChange(!!prof?.must_change_password);
      if (prof?.recovery_email) setRecoveryEmail(prof.recovery_email);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Mínimo 6 caracteres.");
    if (password === "123456") return toast.error("Escolha uma palavra-passe diferente da padrão.");
    if (password !== confirm) return toast.error("As senhas não coincidem.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail.trim())) {
      return toast.error("Informe um e-mail de recuperação válido.");
    }

    setLoading(true);
    const { error, data } = await supabase.auth.updateUser({ password });
    if (error) { setLoading(false); return toast.error(error.message); }
    if (data.user) {
      const { error: pErr } = await supabase
        .from("profiles")
        .update({
          must_change_password: false,
          recovery_email: recoveryEmail.trim(),
        })
        .eq("id", data.user.id);
      if (pErr) { setLoading(false); return toast.error(pErr.message); }
    }
    setLoading(false);
    toast.success("Primeiro acesso concluído!");
    navigate({ to: "/" });
  };

  return (
    <AuthLayout
      title={mustChange ? "Primeiro acesso" : "Nova senha"}
      subtitle={mustChange ? "Defina sua nova senha e e-mail de recuperação para continuar" : "Defina uma nova senha de acesso"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pw">Nova senha</Label>
          <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw2">Confirmar senha</Label>
          <Input id="pw2" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rec">E-mail de recuperação</Label>
          <Input id="rec" type="email" required value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="seuemail@exemplo.com" />
          <p className="text-xs text-muted-foreground">Usado para recuperar a sua conta caso esqueça a senha.</p>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "A salvar…" : "Salvar e continuar"}
        </Button>
      </form>
    </AuthLayout>
  );
}
