export function SignatureGuide() {
  return (
    <div className="border border-border rounded-md p-4 bg-muted/40 space-y-3">
      <div>
        <h4 className="text-sm font-semibold mb-1">Como capturar a sua assinatura</h4>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>A assinatura deve estar nítida e igual à do documento de identificação.</li>
          <li>Assine com caneta azul numa folha totalmente branca.</li>
          <li>Tire uma foto aproximada e bem focada.</li>
        </ul>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Exemplo</div>
        <div className="flex-1 border border-border rounded bg-white px-4 py-3 flex items-center justify-center">
          <svg viewBox="0 0 220 60" className="h-12 w-auto" aria-label="Exemplo de assinatura">
            <path
              d="M10 45 C 25 10, 40 50, 55 30 S 85 5, 100 35 S 130 55, 150 25 C 165 5, 185 45, 210 20"
              fill="none"
              stroke="#1e40af"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
