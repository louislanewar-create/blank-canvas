
# Plano — Ajustes da plataforma (8 blocos)

Este é um plano grande. Vou agrupar em fases entregáveis e implementá-las em sequência após a sua aprovação. Algumas peças já existem (NIF read-only, `must_change_password`, dashboard básico) e serão reforçadas.

---

## Fase 0 — Conta de administrador (rápido)
- Criar utilizador admin com NIF `44209235806` e senha `05061215@Lo`, marcado como não-precisa-trocar-senha, e atribuir `role='admin'` em `user_roles`.

## Fase 1 — Bloco 1: Primeiro acesso obrigatório
- Adicionar coluna `recovery_email` em `profiles`.
- Página `/reset-password` passa a exigir **nova senha + e-mail de recuperação** no primeiro acesso; só liberta `must_change_password=false` quando ambos preenchidos.
- Guard global no `_authenticated.tsx`: se `must_change_password=true`, redirecionar para `/reset-password` (bloqueia qualquer outra rota).
- Login mantém detecção do flag e envia para `/reset-password`.

## Fase 2 — Bloco 2: NIF read-only
- No `cadastro.tsx`, garantir que o input NIF está `disabled` e `readOnly`, com tooltip "Definido pelo administrador". (Reforço — já estava disabled.)

## Fase 3 — Bloco 3: Função + certificação obrigatórias
- Em `validateStep` para a etapa profissional: exigir ≥1 função em `funcoes_colaborador`.
- Mapa simples `funcao → certificação obrigatória` (config no código). Se função exige certificação e nenhuma do tipo correspondente em `certificacoes`, bloqueia o avanço com mensagem clara.
- Botão "Avançar" desabilitado enquanto pendências existirem (reusa o padrão `validateStep`).

## Fase 4 — Bloco 4: Dashboard pós-envio (colaborador)
- Após `status='enviado'` (ou superior) em `profiles`, a rota `/cadastro` redireciona para `/inicio` (dashboard) e bloqueia novo envio.
- Em `/inicio`: listar documentos do utilizador com badge de estado:
  - `Em Análise` (pendente), `Aprovado`, `Rejeitado`, `Expirado` (validade passada), `Próximo da Validade` (≤30 dias).

## Fase 5 — Bloco 5: Aba de Avisos
- Nova rota `/avisos` (colaborador) — lista:
  - Documentos rejeitados (com motivo).
  - Documentos expirados.
  - Documentos a vencer em ≤30 dias.
- Link "Avisos" no `AppShell` com contador (badge numérico).

## Fase 6 — Bloco 6: Dashboard do admin reforçado
- Em `/admin/colaboradores`: adicionar filtros por **NIF, Nome, Empresa, Estado** (pesquisa já existe parcial; adicionar select de status + campo empresa).
- Adicionar coluna `empresa` em `profiles` (se ainda não existir) — *confirmar com você antes*.
- A página de detalhe do colaborador `/admin/colaboradores/$id` mostra todos os documentos para revisão.

## Fase 7 — Bloco 7: Aprovação / rejeição
- Na página de detalhe admin, por documento: botões **Aprovar** / **Rejeitar**.
- Rejeitar abre dialog exigindo `observacao_admin` (obrigatório).
- Colaborador vê o motivo no dashboard e em Avisos; pode **reenviar apenas o documento rejeitado** (upload substitui o `file_url` e volta status para `pendente`).

## Fase 8 — Bloco 8: Fluxo end-to-end
- Verificação manual dos dois fluxos (colaborador / admin) após implementação, ajustando textos e CTAs.

---

## Migrações de BD (resumo)
1. `profiles`: adicionar `recovery_email TEXT`, possivelmente `empresa TEXT`.
2. Seed do admin (NIF `44209235806`).
3. (Opcional) função RPC `get_doc_alerts(user_id)` para avisos — ou cálculo no cliente.

## Pergunta antes de começar
- Quer mesmo adicionar o campo **Empresa** em `profiles` agora? Se sim, deve ser editável pelo admin no detalhe do colaborador?
- O mapa "função → certificação obrigatória" tem regras específicas suas, ou posso usar um placeholder (ex.: função "Eletricista" exige certificação cujo nome contenha "elétr") até você passar a lista oficial?

Responda essas duas perguntas (ou diga "siga com placeholders") e eu executo Fase 0 → Fase 7 de uma vez.
