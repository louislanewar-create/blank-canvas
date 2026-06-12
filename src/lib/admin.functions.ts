import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso negado.");
}

const bulkSchema = z.object({
  nifs: z.array(z.string().trim().min(1).max(30).regex(/^[A-Za-z0-9-]+$/)).min(1).max(200),
});

export const bulkCreateUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => bulkSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const results: Array<{ nif: string; status: "criado" | "existe" | "erro"; message?: string }> = [];

    for (const nif of data.nifs) {
      try {
        const { data: existing } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("nif", nif)
          .maybeSingle();
        if (existing) {
          results.push({ nif, status: "existe" });
          continue;
        }
        const email = `nif-${nif}@placeholder.local`;
        const { error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: "123456",
          email_confirm: true,
          user_metadata: { nif, must_change_password: true },
        });
        if (error) results.push({ nif, status: "erro", message: error.message });
        else results.push({ nif, status: "criado" });
      } catch (e: any) {
        results.push({ nif, status: "erro", message: e?.message ?? "Erro" });
      }
    }

    return { results };
  });

const idSchema = z.object({ userId: z.string().uuid() });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.userId === context.userId) throw new Error("Não pode excluir o próprio utilizador.");
    // Remove related rows first (no FK cascades on these tables)
    const uid = data.userId;
    await Promise.all([
      supabaseAdmin.from("documentos").delete().eq("user_id", uid),
      supabaseAdmin.from("certificacoes").delete().eq("user_id", uid),
      supabaseAdmin.from("funcoes_colaborador").delete().eq("user_id", uid),
      supabaseAdmin.from("enderecos").delete().eq("user_id", uid),
      supabaseAdmin.from("dados_bancarios").delete().eq("user_id", uid),
      supabaseAdmin.from("submissoes").delete().eq("user_id", uid),
      supabaseAdmin.from("user_roles").delete().eq("user_id", uid),
    ]);
    await supabaseAdmin.from("profiles").delete().eq("id", uid);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: "123456",
      user_metadata: { must_change_password: true },
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", data.userId);
    return { ok: true };
  });
