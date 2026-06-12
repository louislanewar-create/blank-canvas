import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/esqueci-senha")({
  component: ForgotPage,
});

function ForgotPage() {
  const [nif, setNif] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: email } = await supabase.rpc("lookup_email_by_nif", { _nif: nif.trim() });
      if (!email) {
        toast.error("NIF não encontrado.");
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Enviamos um link de recuperação para o seu e-mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Recuperar senha" subtitle="Enviaremos um link para o seu e-mail">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nif">NIF</Label>
          <Input id="nif" required value={nif} onChange={(e) => setNif(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "A enviar…" : "Enviar link"}
        </Button>
        <div className="text-xs text-center pt-2">
          <Link to="/login" className="hover:underline">Voltar ao login</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
