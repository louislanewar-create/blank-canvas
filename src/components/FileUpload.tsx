import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, FileCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  userId: string;
  label: string;
  bucket?: "documentos" | "assinaturas";
  currentUrl?: string | null;
  currentName?: string | null;
  onUploaded: (url: string, fileName: string) => void;
  onCleared?: () => void;
  accept?: string;
  required?: boolean;
}

export function FileUpload({
  userId,
  label,
  bucket = "documentos",
  currentUrl,
  currentName,
  onUploaded,
  onCleared,
  accept = "image/*,application/pdf",
  required,
}: Props) {
  const [uploading, setUploading] = useState(false);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo deve ter no máximo 10MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file);
      if (error) throw error;
      onUploaded(path, file.name);
      toast.success("Arquivo enviado.");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao enviar");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="border border-border rounded-md p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium flex items-center gap-1.5">
            {label}
            {required && <span className="text-destructive">*</span>}
          </div>
          {currentUrl ? (
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
              <FileCheck className="h-3 w-3 shrink-0" /> {currentName || "Arquivo enviado"}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mt-0.5">Nenhum arquivo</div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {currentUrl && onCleared && (
            <Button type="button" variant="ghost" size="sm" onClick={onCleared}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
            <label className="cursor-pointer">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
              {uploading ? "" : currentUrl ? "Substituir" : "Anexar"}
              <input type="file" accept={accept} className="hidden" onChange={handle} disabled={uploading} />
            </label>
          </Button>
        </div>
      </div>
    </div>
  );
}
