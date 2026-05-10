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
