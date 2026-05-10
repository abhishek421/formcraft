export type Field = {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  position: number;
  variable?: string;
  config: Record<string, unknown>;
  logic?: LogicJump[];
  question_group_id?: string | null;
};

export type VariantAssignment = {
  question_group_id: string;
  variant_id: string;
  title?: string;
  description?: string;
  type?: string;
  config?: Record<string, unknown>;
  logic?: LogicJump[];
};

export type LogicJump = {
  id: string;
  operator: string;
  value: string;
  destination_field_id: string | null;
};

export type Form = {
  id: string;
  title: string;
  settings: Record<string, unknown>;
  theme: {
    primary_color: string;
    background_color: string;
    font: string;
    display_font?: string;
    body_font?: string;
    button_radius?: string;
    brand_name?: string;
    brand_logo_url?: string;
  };
};

export type Answers = Record<string, unknown>;
