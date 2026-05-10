import { z } from "zod";

export const WidgetTypeSchema = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "phone",
  "url",
  "date",
  "dropdown",
  "multiple_choice",
  "yes_no",
  "rating",
  "opinion_scale",
  "file_upload",
  "statement",
  "welcome_screen",
]);

export type WidgetType = z.infer<typeof WidgetTypeSchema>;

export const BaseFieldSchema = z.object({
  id: z.string(),
  type: WidgetTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  variable: z.string().optional(), // {{variable_name}} binding
  question_group_id: z.string().uuid().optional(),
});

export const ChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const FieldSchema = BaseFieldSchema.and(
  z.union([
    z.object({ type: z.literal("short_text") }),
    z.object({ type: z.literal("long_text") }),
    z.object({ type: z.literal("email") }),
    z.object({ type: z.literal("number") }),
    z.object({ type: z.literal("phone") }),
    z.object({ type: z.literal("url") }),
    z.object({ type: z.literal("date") }),
    z.object({ type: z.literal("yes_no") }),
    z.object({ type: z.literal("rating"), steps: z.number().default(5) }),
    z.object({ type: z.literal("opinion_scale"), steps: z.number().default(10) }),
    z.object({ type: z.literal("file_upload") }),
    z.object({ type: z.literal("statement") }),
    z.object({ type: z.literal("welcome_screen") }),
    z.object({
      type: z.literal("dropdown"),
      choices: z.array(ChoiceSchema),
    }),
    z.object({
      type: z.literal("multiple_choice"),
      choices: z.array(ChoiceSchema),
      allow_multiple: z.boolean().default(false),
    }),
  ])
);

export type Field = z.infer<typeof FieldSchema>;

export const LogicConditionSchema = z.object({
  field_id: z.string(),
  operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than", "is_filled", "is_empty"]),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

export const LogicJumpSchema = z.object({
  conditions: z.array(LogicConditionSchema),
  destination_field_id: z.string().nullable(), // null = end of form
});

export const FormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FieldSchema),
  logic: z.record(z.string(), z.array(LogicJumpSchema)).default({}), // field_id -> jumps
  settings: z.object({
    show_progress_bar: z.boolean().default(true),
    show_question_number: z.boolean().default(true),
    one_question_at_a_time: z.boolean().default(true),
  }).default({}),
  theme: z.object({
    primary_color: z.string().default("#000000"),
    background_color: z.string().default("#ffffff"),
    font: z.string().default("Inter"),
  }).default({}),
});

export type Form = z.infer<typeof FormSchema>;

// v1.5: Experiment schemas

export const QuestionGroupSchema = z.object({
  id: z.string().uuid(),
  form_id: z.string().uuid(),
  label: z.string(),
  optimization_goal: z.enum(["completion_rate", "answer_time", "composite"]).default("completion_rate"),
  strategy: z.enum(["epsilon_greedy", "equal"]).default("epsilon_greedy"),
  created_at: z.string().datetime(),
});

export type QuestionGroup = z.infer<typeof QuestionGroupSchema>;

export const QuestionVariantSchema = z.object({
  id: z.string().uuid(),
  question_group_id: z.string().uuid(),
  variant_label: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.string(),
  config: z.record(z.unknown()).default({}),
  logic: z.array(z.unknown()).default([]),
  traffic_weight: z.number().default(1.0),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
});

export type QuestionVariant = z.infer<typeof QuestionVariantSchema>;

export const FormSessionSchema = z.object({
  id: z.string().uuid(),
  form_id: z.string().uuid(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  device_type: z.string().optional(),
  referrer: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export type FormSession = z.infer<typeof FormSessionSchema>;

export const QuestionEventTypeSchema = z.enum([
  "shown",
  "answered",
  "skipped",
  "abandoned",
  "backtracked",
  "validation_error",
]);

export type QuestionEventType = z.infer<typeof QuestionEventTypeSchema>;

export const QuestionEventSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  variant_id: z.string().uuid().optional(),
  field_id: z.string().uuid().optional(),
  event_type: QuestionEventTypeSchema,
  duration_ms: z.number().int().optional(),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
});

export type QuestionEvent = z.infer<typeof QuestionEventSchema>;

export const VariantAssignmentSchema = z.object({
  session_id: z.string().uuid(),
  question_group_id: z.string().uuid(),
  variant_id: z.string().uuid(),
  assigned_at: z.string().datetime(),
});

export type VariantAssignment = z.infer<typeof VariantAssignmentSchema>;
