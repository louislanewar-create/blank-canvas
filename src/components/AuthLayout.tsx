import type { ReactNode } from "react";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
        <div className="flex items-center gap-3 font-bold tracking-tight">
          <div className="h-8 w-8 bg-primary-foreground" />
          <span className="text-lg">COLABORADORES</span>
        </div>
        <div>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight">
            Gestão de<br />colaboradores,<br />etapa por etapa.
          </h1>
          <p className="mt-6 text-primary-foreground/70 max-w-md">
            Cadastro, documentação e validação administrativa em um único fluxo, claro e organizado.
          </p>
        </div>
        <div className="text-xs text-primary-foreground/50">© {new Date().getFullYear()}</div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
