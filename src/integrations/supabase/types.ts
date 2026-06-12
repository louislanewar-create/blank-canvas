export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      certificacoes: {
        Row: {
          created_at: string
          data_emissao: string | null
          data_validade: string | null
          documento_url: string | null
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_emissao?: string | null
          data_validade?: string | null
          documento_url?: string | null
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_emissao?: string | null
          data_validade?: string | null
          documento_url?: string | null
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      dados_bancarios: {
        Row: {
          comprovativo_url: string | null
          iban: string | null
          titular_confirmado: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          comprovativo_url?: string | null
          iban?: string | null
          titular_confirmado?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          comprovativo_url?: string | null
          iban?: string | null
          titular_confirmado?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documentos: {
        Row: {
          created_at: string
          data_validade: string | null
          file_name: string | null
          file_url: string
          id: string
          observacao_admin: string | null
          status: Database["public"]["Enums"]["documento_status"]
          tipo: Database["public"]["Enums"]["documento_tipo"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_validade?: string | null
          file_name?: string | null
          file_url: string
          id?: string
          observacao_admin?: string | null
          status?: Database["public"]["Enums"]["documento_status"]
          tipo: Database["public"]["Enums"]["documento_tipo"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_validade?: string | null
          file_name?: string | null
          file_url?: string
          id?: string
          observacao_admin?: string | null
          status?: Database["public"]["Enums"]["documento_status"]
          tipo?: Database["public"]["Enums"]["documento_tipo"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enderecos: {
        Row: {
          cidade: string | null
          codigo_postal: string | null
          complemento: string | null
          distrito: string | null
          numero: string | null
          pais: string | null
          rua: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cidade?: string | null
          codigo_postal?: string | null
          complemento?: string | null
          distrito?: string | null
          numero?: string | null
          pais?: string | null
          rua?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cidade?: string | null
          codigo_postal?: string | null
          complemento?: string | null
          distrito?: string | null
          numero?: string | null
          pais?: string | null
          rua?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      funcoes_colaborador: {
        Row: {
          created_at: string
          funcao: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          funcao: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          funcao?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          escolaridade: string | null
          estado_civil: string | null
          etapa_atual: number
          id: string
          must_change_password: boolean
          nif: string
          niss: string | null
          nome: string | null
          recovery_email: string | null
          status: Database["public"]["Enums"]["submission_status"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          escolaridade?: string | null
          estado_civil?: string | null
          etapa_atual?: number
          id: string
          must_change_password?: boolean
          nif: string
          niss?: string | null
          nome?: string | null
          recovery_email?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          escolaridade?: string | null
          estado_civil?: string | null
          etapa_atual?: number
          id?: string
          must_change_password?: boolean
          nif?: string
          niss?: string | null
          nome?: string | null
          recovery_email?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      submissoes: {
        Row: {
          assinatura_url: string | null
          enviado_em: string
          id: string
          lgpd_aceito: boolean
          user_id: string
        }
        Insert: {
          assinatura_url?: string | null
          enviado_em?: string
          id?: string
          lgpd_aceito?: boolean
          user_id: string
        }
        Update: {
          assinatura_url?: string | null
          enviado_em?: string
          id?: string
          lgpd_aceito?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      lookup_email_by_nif: { Args: { _nif: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "colaborador"
      documento_status:
        | "pendente"
        | "aprovado"
        | "reprovado"
        | "correcao_solicitada"
      documento_tipo:
        | "passaporte"
        | "titulo_residencia"
        | "carta_conducao"
        | "cartao_saude"
        | "comprovativo_morada"
        | "comprovativo_bancario"
        | "certificacao"
        | "assinatura"
        | "outro"
      submission_status:
        | "rascunho"
        | "enviado"
        | "aprovado"
        | "reprovado"
        | "correcao_solicitada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "colaborador"],
      documento_status: [
        "pendente",
        "aprovado",
        "reprovado",
        "correcao_solicitada",
      ],
      documento_tipo: [
        "passaporte",
        "titulo_residencia",
        "carta_conducao",
        "cartao_saude",
        "comprovativo_morada",
        "comprovativo_bancario",
        "certificacao",
        "assinatura",
        "outro",
      ],
      submission_status: [
        "rascunho",
        "enviado",
        "aprovado",
        "reprovado",
        "correcao_solicitada",
      ],
    },
  },
} as const
