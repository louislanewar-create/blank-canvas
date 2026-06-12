import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/FileUpload";
import { Stepper } from "@/components/Stepper";
import { RgpdDialog } from "@/components/RgpdDialog";
import { SignatureGuide } from "@/components/SignatureGuide";
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle2, Send, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cadastro")({
  component: WizardPage,
});

const STEPS = [
  "Dados Pessoais",
  "Morada",
  "Profissional",
  "Bancário",
  "Resumo Geral",
  "Conclusão",
];

type DocMap = Record<string, { url: string; name: string } | undefined>;

function WizardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [profile, setProfile] = useState<any>({});
  const [endereco, setEndereco] = useState<any>({});
  const [funcoes, setFuncoes] = useState<string[]>([""]);
  const [certs, setCerts] = useState<any[]>([]);
  const [bancario, setBancario] = useState<any>({ titular_confirmado: false });
  const [docs, setDocs] = useState<DocMap>({});
  const [lgpd, setLgpd] = useState(false);
  const [assinatura, setAssinatura] = useState<{ url: string; name: string } | undefined>();

  const { data: bootstrap, isLoading } = useQuery({
    queryKey: ["wizard", user?.id],
    queryFn: async () => {
      const uid = user!.id;
      const [p, e, f, c, b, d] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("enderecos").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("funcoes_colaborador").select("*").eq("user_id", uid),
        supabase.from("certificacoes").select("*").eq("user_id", uid),
        supabase.from("dados_bancarios").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("documentos").select("*").eq("user_id", uid),
      ]);
      return { p: p.data, e: e.data, f: f.data ?? [], c: c.data ?? [], b: b.data, d: d.data ?? [] };
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!bootstrap) return;
    // Block new submissions once already enviado/aprovado/etc.
    if (bootstrap.p && bootstrap.p.status && bootstrap.p.status !== "rascunho" && bootstrap.p.status !== "correcao_solicitada") {
      navigate({ to: "/inicio" });
      return;
    }
    if (bootstrap.p) {
      setProfile(bootstrap.p);
      setStep(bootstrap.p.etapa_atual || 1);
    }
    if (bootstrap.e) setEndereco(bootstrap.e);
    if (bootstrap.f.length) setFuncoes(bootstrap.f.map((x: any) => x.funcao));
    if (bootstrap.c.length) setCerts(bootstrap.c);
    if (bootstrap.b) setBancario(bootstrap.b);
    const dm: DocMap = {};
    bootstrap.d.forEach((x: any) => {
      dm[x.tipo] = { url: x.file_url, name: x.file_name || "" };
    });
    setDocs(dm);
    const ass = bootstrap.d.find((x: any) => x.tipo === "assinatura");
    if (ass) setAssinatura({ url: ass.file_url, name: ass.file_name || "" });
  }, [bootstrap, navigate]);

  const uid = user!.id;

  const upsertDoc = async (tipo: string, url: string, name: string) => {
    const existing = (bootstrap?.d ?? []).find((x: any) => x.tipo === tipo);
    if (existing) {
      await supabase.from("documentos").update({ file_url: url, file_name: name, status: "pendente" }).eq("id", existing.id);
    } else {
      await supabase.from("documentos").insert({ user_id: uid, tipo: tipo as any, file_url: url, file_name: name });
    }
    qc.invalidateQueries({ queryKey: ["wizard", uid] });
    setDocs((prev) => ({ ...prev, [tipo]: { url, name } }));
  };

  const removeDoc = async (tipo: string) => {
    await supabase.from("documentos").delete().eq("user_id", uid).eq("tipo", tipo as any);
    qc.invalidateQueries({ queryKey: ["wizard", uid] });
    setDocs((prev) => ({ ...prev, [tipo]: undefined }));
  };

  const saveStep = async (next: number) => {
    setSaving(true);
    try {
      if (step === 1) {
        await supabase.from("profiles").update({
          nome: profile.nome, niss: profile.niss, telefone: profile.telefone,
          estado_civil: profile.estado_civil, escolaridade: profile.escolaridade,
          etapa_atual: Math.max(profile.etapa_atual || 1, next),
        }).eq("id", uid);
      } else if (step === 2) {
        await supabase.from("enderecos").upsert({ user_id: uid, ...endereco });
        await supabase.from("profiles").update({ etapa_atual: Math.max(profile.etapa_atual || 1, next) }).eq("id", uid);
      } else if (step === 3) {
        await supabase.from("funcoes_colaborador").delete().eq("user_id", uid);
        const filtered = funcoes.filter((f) => f.trim());
        if (filtered.length) {
          await supabase.from("funcoes_colaborador").insert(filtered.map((funcao) => ({ user_id: uid, funcao })));
        }
        // upsert certs
        await supabase.from("certificacoes").delete().eq("user_id", uid);
        if (certs.length) {
          await supabase.from("certificacoes").insert(certs.map((c) => ({
            user_id: uid, nome: c.nome, data_emissao: c.data_emissao || null,
            data_validade: c.data_validade || null, documento_url: c.documento_url || null,
          })));
        }
        await supabase.from("profiles").update({ etapa_atual: Math.max(profile.etapa_atual || 1, next) }).eq("id", uid);
      } else if (step === 4) {
        await supabase.from("dados_bancarios").upsert({ user_id: uid, ...bancario });
        await supabase.from("profiles").update({ etapa_atual: Math.max(profile.etapa_atual || 1, next) }).eq("id", uid);
      }
      setShowSummary(false);
      setStep(next);
      qc.invalidateQueries({ queryKey: ["wizard", uid] });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const validateStep = (n: number): string | null => {
    if (n === 1) {
      if (!profile.nome?.trim()) return "Preencha o nome completo.";
      if (!profile.telefone?.trim()) return "Preencha o telefone.";
      if (!profile.estado_civil) return "Selecione o estado civil.";
      if (!profile.escolaridade) return "Selecione a escolaridade.";
    }
    if (n === 2) {
      if (!endereco.codigo_postal?.trim()) return "Preencha o código postal.";
      if (!endereco.cidade?.trim()) return "Preencha a cidade.";
      if (!endereco.rua?.trim()) return "Preencha a rua.";
      if (!docs.comprovativo_morada?.url) return "Anexe o comprovativo de morada.";
    }
    if (n === 3) {
      if (!funcoes.some((f) => f.trim())) return "Adicione pelo menos uma função.";
      if (!certs.some((c: any) => c?.nome?.trim())) return "Adicione pelo menos uma certificação correspondente à função.";
    }
    if (n === 4) {
      if (!bancario.iban?.trim()) return "Preencha o IBAN.";
      if (!bancario.titular_confirmado) return "Confirme que a conta pertence a si.";
      if (!docs.comprovativo_bancario?.url) return "Anexe o comprovativo bancário.";
    }
    return null;
  };

  const handleAdvance = () => {
    const err = validateStep(step);
    if (err) return toast.error(err);
    if (!showSummary && step <= 4) setShowSummary(true);
    else saveStep(step + 1);
  };

  const handleSubmitFinal = async () => {
    if (!lgpd) return toast.error("Aceite o termo LGPD.");
    if (!assinatura) return toast.error("Anexe sua assinatura.");
    setSaving(true);
    try {
      await supabase.from("submissoes").insert({
        user_id: uid, lgpd_aceito: true, assinatura_url: assinatura.url,
      });
      await supabase.from("profiles").update({ status: "enviado" }).eq("id", uid);
      toast.success("Formulário enviado com sucesso!");
      navigate({ to: "/inicio" });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao enviar");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-sm text-muted-foreground">A carregar…</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Stepper steps={STEPS} current={step} />

      <div className="border border-border rounded-lg p-6 bg-card">
        {!showSummary && step === 1 && (
          <StepDados profile={profile} setProfile={setProfile} docs={docs} uid={uid}
            onUpload={upsertDoc} onClear={removeDoc} />
        )}
        {!showSummary && step === 2 && (
          <StepMorada endereco={endereco} setEndereco={setEndereco} docs={docs} uid={uid}
            onUpload={upsertDoc} onClear={removeDoc} />
        )}
        {!showSummary && step === 3 && (
          <StepProfissional funcoes={funcoes} setFuncoes={setFuncoes} certs={certs} setCerts={setCerts} uid={uid} />
        )}
        {!showSummary && step === 4 && (
          <StepBancario bancario={bancario} setBancario={setBancario} docs={docs} uid={uid}
            onUpload={upsertDoc} onClear={removeDoc} />
        )}
        {(showSummary || step === 5) && step !== 6 && (
          <Resumo profile={profile} endereco={endereco} funcoes={funcoes} certs={certs}
            bancario={bancario} docs={docs} stepView={showSummary ? step : 5} />
        )}
        {step === 6 && (
          <StepConclusao lgpd={lgpd} setLgpd={setLgpd} assinatura={assinatura}
            uid={uid} onAssinatura={(url: string, name: string) => {
              upsertDoc("assinatura", url, name);
              setAssinatura({ url, name });
            }} />
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <div>
            {showSummary && (
              <Button variant="outline" onClick={() => setShowSummary(false)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Corrigir Informações
              </Button>
            )}
            {!showSummary && step > 1 && step < 6 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
            )}
          </div>
          <div>
            {step < 5 && (
              <Button
                onClick={handleAdvance}
                disabled={saving || (!showSummary && !!validateStep(step))}
                title={!showSummary ? validateStep(step) ?? undefined : undefined}
              >
                {showSummary ? "Confirmar e Avançar" : "Revisar"} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 5 && (
              <Button onClick={() => setStep(6)}>
                Avançar para conclusão <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 6 && (
              <Button onClick={handleSubmitFinal} disabled={saving}>
                <Send className="h-4 w-4 mr-2" /> Enviar Formulário
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, required }: any) {
  return (
    <div className="space-y-1.5">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      {children}
    </div>
  );
}

function StepDados({ profile, setProfile, docs, uid, onUpload, onClear }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">Dados Pessoais</h2>
        <p className="text-sm text-muted-foreground">Preencha suas informações básicas</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nome completo" required>
          <Input value={profile.nome ?? ""} onChange={(e) => setProfile({ ...profile, nome: e.target.value })} />
        </Field>
        <Field label="NIF" required>
          <Input value={profile.nif ?? ""} disabled />
        </Field>
        <Field label="NISS"><Input value={profile.niss ?? ""} onChange={(e) => setProfile({ ...profile, niss: e.target.value })} /></Field>
        <Field label="Telefone"><Input value={profile.telefone ?? ""} onChange={(e) => setProfile({ ...profile, telefone: e.target.value })} /></Field>
        <Field label="Estado civil">
          <Select value={profile.estado_civil ?? ""} onValueChange={(v) => setProfile({ ...profile, estado_civil: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="solteiro">Solteiro(a)</SelectItem>
              <SelectItem value="casado">Casado(a)</SelectItem>
              <SelectItem value="divorciado">Divorciado(a)</SelectItem>
              <SelectItem value="viuvo">Viúvo(a)</SelectItem>
              <SelectItem value="uniao">União de facto</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Grau de escolaridade">
          <Select value={profile.escolaridade ?? ""} onValueChange={(v) => setProfile({ ...profile, escolaridade: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="basico">Básico</SelectItem>
              <SelectItem value="secundario">Secundário</SelectItem>
              <SelectItem value="licenciatura">Licenciatura</SelectItem>
              <SelectItem value="mestrado">Mestrado</SelectItem>
              <SelectItem value="doutoramento">Doutoramento</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div>
        <h3 className="text-sm font-semibold mt-4 mb-2">Documentos</h3>
        <div className="space-y-2">
          {[
            ["passaporte", "Passaporte"],
            ["titulo_residencia", "Título de residência"],
            ["carta_conducao", "Carta de condução"],
            ["cartao_saude", "Cartão de saúde"],
          ].map(([tipo, label]) => (
            <FileUpload key={tipo} userId={uid} label={label}
              currentUrl={docs[tipo]?.url} currentName={docs[tipo]?.name}
              onUploaded={(url, name) => onUpload(tipo, url, name)}
              onCleared={() => onClear(tipo)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepMorada({ endereco, setEndereco, docs, uid, onUpload, onClear }: any) {
  const lookupCP = async (cp: string) => {
    if (!/^\d{4}-\d{3}$/.test(cp)) return;
    try {
      const r = await fetch(`https://api.zippopotam.us/PT/${cp}`);
      if (!r.ok) return;
      const d = await r.json();
      const place = d.places?.[0];
      if (place) {
        setEndereco({ ...endereco, codigo_postal: cp, cidade: place["place name"], distrito: place["state"], pais: "Portugal" });
      }
    } catch {}
  };
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">Morada</h2>
        <p className="text-sm text-muted-foreground">Preencha seu endereço</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Código Postal" required>
          <Input placeholder="0000-000" value={endereco.codigo_postal ?? ""}
            onChange={(e) => setEndereco({ ...endereco, codigo_postal: e.target.value })}
            onBlur={(e) => lookupCP(e.target.value)} />
        </Field>
        <Field label="Cidade"><Input value={endereco.cidade ?? ""} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} /></Field>
        <Field label="Distrito"><Input value={endereco.distrito ?? ""} onChange={(e) => setEndereco({ ...endereco, distrito: e.target.value })} /></Field>
        <Field label="País"><Input value={endereco.pais ?? "Portugal"} onChange={(e) => setEndereco({ ...endereco, pais: e.target.value })} /></Field>
        <Field label="Rua"><Input value={endereco.rua ?? ""} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Número"><Input value={endereco.numero ?? ""} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} /></Field>
          <Field label="Complemento"><Input value={endereco.complemento ?? ""} onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })} /></Field>
        </div>
      </div>
      <FileUpload userId={uid} label="Comprovativo de morada"
        currentUrl={docs.comprovativo_morada?.url} currentName={docs.comprovativo_morada?.name}
        onUploaded={(url, name) => onUpload("comprovativo_morada", url, name)}
        onCleared={() => onClear("comprovativo_morada")} required />
    </div>
  );
}

function StepProfissional({ funcoes, setFuncoes, certs, setCerts, uid }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">Profissional</h2>
        <p className="text-sm text-muted-foreground">Funções e certificações</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Funções</h3>
        <div className="space-y-2">
          {funcoes.map((f: string, i: number) => (
            <div key={i} className="flex gap-2">
              <Input value={f} placeholder="Ex.: Eletricista" onChange={(e) => {
                const next = [...funcoes]; next[i] = e.target.value; setFuncoes(next);
              }} />
              {funcoes.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => setFuncoes(funcoes.filter((_: any, j: number) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => setFuncoes([...funcoes, ""])}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar função
        </Button>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Certificações</h3>
        <div className="space-y-3">
          {certs.map((c: any, i: number) => (
            <div key={i} className="border border-border rounded-md p-3 space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Nome">
                  <Input value={c.nome ?? ""} onChange={(e) => { const n = [...certs]; n[i] = { ...c, nome: e.target.value }; setCerts(n); }} />
                </Field>
                <Field label="Emissão">
                  <Input type="date" value={c.data_emissao ?? ""} onChange={(e) => { const n = [...certs]; n[i] = { ...c, data_emissao: e.target.value }; setCerts(n); }} />
                </Field>
                <Field label="Validade">
                  <Input type="date" value={c.data_validade ?? ""} onChange={(e) => { const n = [...certs]; n[i] = { ...c, data_validade: e.target.value }; setCerts(n); }} />
                </Field>
              </div>
              <FileUpload userId={uid} label="Documento PDF" accept="application/pdf"
                currentUrl={c.documento_url} currentName={c.documento_url ? "PDF anexado" : ""}
                onUploaded={(url) => { const n = [...certs]; n[i] = { ...c, documento_url: url }; setCerts(n); }}
                onCleared={() => { const n = [...certs]; n[i] = { ...c, documento_url: null }; setCerts(n); }} />
              <Button variant="ghost" size="sm" onClick={() => setCerts(certs.filter((_: any, j: number) => j !== i))}>
                <Trash2 className="h-4 w-4 mr-1" /> Remover
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => setCerts([...certs, { nome: "" }])}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar certificação
        </Button>
      </div>
    </div>
  );
}

function StepBancario({ bancario, setBancario, docs, uid, onUpload, onClear }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">Dados Bancários</h2>
        <p className="text-sm text-muted-foreground">IBAN e comprovativo</p>
      </div>
      <Field label="IBAN" required>
        <Input value={bancario.iban ?? ""} placeholder="PT50 0000 0000 0000 0000 0000 0"
          onChange={(e) => setBancario({ ...bancario, iban: e.target.value })} />
      </Field>
      <FileUpload userId={uid} label="Comprovativo bancário"
        currentUrl={docs.comprovativo_bancario?.url} currentName={docs.comprovativo_bancario?.name}
        onUploaded={(url, name) => onUpload("comprovativo_bancario", url, name)}
        onCleared={() => onClear("comprovativo_bancario")} required />
      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <Checkbox checked={bancario.titular_confirmado} onCheckedChange={(v) => setBancario({ ...bancario, titular_confirmado: !!v })} />
        <span>Confirmo que a conta indicada pertence a mim.</span>
      </label>
    </div>
  );
}

function Resumo({ profile, endereco, funcoes, certs, bancario, docs }: any) {
  const Row = ({ k, v }: any) => (
    <div className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v || "—"}</span>
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5" />
        <h2 className="text-xl font-bold">Resumo das informações</h2>
      </div>
      <p className="text-sm text-muted-foreground">Revise os dados antes de confirmar.</p>

      <section>
        <h3 className="font-semibold text-sm uppercase tracking-wider mb-2">Dados Pessoais</h3>
        <Row k="Nome" v={profile.nome} />
        <Row k="NIF" v={profile.nif} />
        <Row k="NISS" v={profile.niss} />
        <Row k="Telefone" v={profile.telefone} />
        <Row k="Estado civil" v={profile.estado_civil} />
        <Row k="Escolaridade" v={profile.escolaridade} />
      </section>
      <section>
        <h3 className="font-semibold text-sm uppercase tracking-wider mb-2">Morada</h3>
        <Row k="Código Postal" v={endereco.codigo_postal} />
        <Row k="Endereço" v={[endereco.rua, endereco.numero, endereco.cidade].filter(Boolean).join(", ")} />
      </section>
      <section>
        <h3 className="font-semibold text-sm uppercase tracking-wider mb-2">Profissional</h3>
        <Row k="Funções" v={funcoes.filter(Boolean).join(", ")} />
        <Row k="Certificações" v={certs.map((c: any) => c.nome).join(", ")} />
      </section>
      <section>
        <h3 className="font-semibold text-sm uppercase tracking-wider mb-2">Bancário</h3>
        <Row k="IBAN" v={bancario.iban} />
        <Row k="Confirmou titular" v={bancario.titular_confirmado ? "Sim" : "Não"} />
      </section>
      <section>
        <h3 className="font-semibold text-sm uppercase tracking-wider mb-2">Documentos enviados</h3>
        {Object.entries(docs).filter(([, v]) => v).map(([k, v]: any) => (
          <Row key={k} k={k.replace(/_/g, " ")} v={v?.name || "OK"} />
        ))}
      </section>
    </div>
  );
}

function StepConclusao({ lgpd, setLgpd, assinatura, uid, onAssinatura }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">Conclusão</h2>
        <p className="text-sm text-muted-foreground">Declare a veracidade e assine para enviar.</p>
      </div>

      <div className="border border-border rounded-md p-4 bg-muted/30 space-y-2">
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <Checkbox checked={lgpd} onCheckedChange={(v) => setLgpd(!!v)} />
          <span>
            Declaro que todas as informações estão corretas e aceito o tratamento dos meus dados conforme o
            {" "}
            <RgpdDialog
              trigger={
                <button type="button" className="underline font-medium inline-flex items-center gap-0.5">
                  termo RGPD <ExternalLink className="h-3 w-3" />
                </button>
              }
            />
            .
          </span>
        </label>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Assinatura</h3>
        <SignatureGuide />
        <FileUpload
          userId={uid}
          label="Foto da assinatura"
          bucket="assinaturas"
          accept="image/*"
          currentUrl={assinatura?.url}
          currentName={assinatura?.name}
          onUploaded={(url, name) => onAssinatura(url, name)}
          required
        />
      </div>
    </div>
  );
}
