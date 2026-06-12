import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RgpdDialog({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Termo de Consentimento — RGPD</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              <strong>Regulamento Geral sobre a Proteção de Dados (RGPD)</strong> — Regulamento (UE) 2016/679.
            </p>
            <p>
              Ao aceitar este termo, declara estar informado(a) e dar o seu consentimento expresso para a recolha,
              registo, organização, conservação, consulta, utilização e transmissão dos dados pessoais fornecidos
              através deste formulário pela entidade empregadora, exclusivamente para as finalidades indicadas.
            </p>
            <p>
              <strong>Finalidades do tratamento:</strong> gestão administrativa e contratual do colaborador,
              cumprimento de obrigações legais (fiscais, segurança social, saúde e segurança no trabalho),
              processamento salarial e comunicação interna.
            </p>
            <p>
              <strong>Categorias de dados:</strong> identificação (nome, NIF, NISS), contactos, morada,
              estado civil, escolaridade, dados bancários, certificações profissionais e documentos comprovativos.
            </p>
            <p>
              <strong>Conservação:</strong> os dados serão conservados pelo período legalmente exigido após o
              término da relação contratual.
            </p>
            <p>
              <strong>Direitos do titular:</strong> tem o direito de aceder, retificar, apagar, limitar ou opor-se
              ao tratamento, bem como o direito à portabilidade dos seus dados, mediante pedido escrito ao
              responsável pelo tratamento.
            </p>
            <p>
              <strong>Segurança:</strong> são adotadas medidas técnicas e organizativas adequadas para garantir
              a confidencialidade, integridade e disponibilidade dos seus dados.
            </p>
            <p>
              Pode retirar o seu consentimento a qualquer momento, sem prejuízo da licitude do tratamento
              efetuado com base no consentimento previamente dado.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
