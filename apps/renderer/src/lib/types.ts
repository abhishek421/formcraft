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
  };
};

export type Answers = Record<string, unknown>;
