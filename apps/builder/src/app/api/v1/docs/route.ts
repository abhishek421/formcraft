const spec = {
  openapi: "3.1.0",
  info: {
    title: "FormCraft API",
    version: "1.0.0",
    description:
      "REST API for FormCraft — create and manage forms, fields, responses, and self-optimizing A/B experiments.",
  },
  servers: [{ url: "/api/v1" }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "API key from the FormCraft dashboard.",
      },
    },
    schemas: {
      Form: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          published: { type: "boolean" },
          settings: {
            type: "object",
            properties: {
              show_progress_bar: { type: "boolean" },
              show_question_number: { type: "boolean" },
              one_question_at_a_time: { type: "boolean" },
            },
          },
          theme: {
            type: "object",
            description: "Visual style and branding for the form renderer.",
            properties: {
              primary_color: { type: "string", description: "Hex color for buttons and accents. Default: #CAFF00" },
              background_color: { type: "string", description: "Hex color for the form background. Default: #080808" },
              display_font: { type: "string", description: "Google Font name for headings. Default: Syne" },
              body_font: { type: "string", description: "Google Font name for body text and inputs. Default: DM Mono" },
              button_radius: { type: "string", description: "CSS border-radius for buttons, e.g. '0px', '8px', '999px'. Default: 0px" },
              brand_name: { type: "string", description: "Brand name shown in the top-left corner of the form." },
              brand_logo_url: { type: "string", description: "URL of a logo image shown in the top-left corner alongside brand_name." },
            },
          },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Field: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          form_id: { type: "string", format: "uuid" },
          type: {
            type: "string",
            enum: [
              "short_text", "long_text", "email", "number", "phone", "url",
              "date", "dropdown", "multiple_choice", "yes_no", "rating",
              "opinion_scale", "file_upload", "statement", "welcome_screen",
            ],
          },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          required: { type: "boolean" },
          position: { type: "integer" },
          variable: { type: "string", nullable: true },
          config: { type: "object" },
          logic: { type: "array", items: { type: "object" } },
          question_group_id: { type: "string", format: "uuid", nullable: true },
        },
      },
      Response: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          form_id: { type: "string", format: "uuid" },
          session_id: { type: "string", format: "uuid", nullable: true },
          started_at: { type: "string", format: "date-time" },
          submitted_at: { type: "string", format: "date-time", nullable: true },
          metadata: { type: "object" },
          answers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field_id: { type: "string", format: "uuid" },
                value: {},
              },
            },
          },
        },
      },
      QuestionGroup: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          form_id: { type: "string", format: "uuid" },
          label: { type: "string" },
          optimization_goal: {
            type: "string",
            enum: ["completion_rate", "answer_time", "composite"],
          },
          strategy: {
            type: "string",
            enum: ["epsilon_greedy", "equal"],
          },
          created_at: { type: "string", format: "date-time" },
        },
      },
      QuestionVariant: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          question_group_id: { type: "string", format: "uuid" },
          variant_label: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          type: { type: "string" },
          config: { type: "object" },
          logic: { type: "array", items: { type: "object" } },
          traffic_weight: { type: "number" },
          is_active: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      VariantAnalytics: {
        type: "object",
        properties: {
          variant_id: { type: "string", format: "uuid" },
          label: { type: "string" },
          impressions: { type: "integer" },
          answer_rate: { type: "number" },
          avg_answer_time_ms: { type: "number", nullable: true },
          abandonment_rate: { type: "number" },
          traffic_weight: { type: "number" },
          is_active: { type: "boolean" },
          is_winner: { type: "boolean" },
        },
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
  paths: {
    // ── Forms ────────────────────────────────────────────────────────────────
    "/forms": {
      get: {
        summary: "List forms",
        operationId: "listForms",
        tags: ["Forms"],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    forms: { type: "array", items: { $ref: "#/components/schemas/Form" } },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        pages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a form",
        operationId: "createForm",
        tags: ["Forms"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: { "application/json": { schema: { type: "object", properties: { form: { $ref: "#/components/schemas/Form" } } } } },
          },
        },
      },
    },
    "/forms/{id}": {
      get: {
        summary: "Get a form",
        operationId: "getForm",
        tags: ["Forms"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { form: { $ref: "#/components/schemas/Form" } } } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      patch: {
        summary: "Update a form",
        operationId: "updateForm",
        tags: ["Forms"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  published: { type: "boolean" },
                  settings: { type: "object" },
                  theme: { $ref: "#/components/schemas/Form/properties/theme" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { form: { $ref: "#/components/schemas/Form" } } } } } },
        },
      },
      delete: {
        summary: "Delete a form",
        operationId: "deleteForm",
        tags: ["Forms"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "204": { description: "Deleted" } },
      },
    },

    // ── Fields ───────────────────────────────────────────────────────────────
    "/forms/{id}/fields": {
      get: {
        summary: "List fields",
        operationId: "listFields",
        tags: ["Fields"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { fields: { type: "array", items: { $ref: "#/components/schemas/Field" } } } } } } },
        },
      },
      post: {
        summary: "Create a field",
        operationId: "createField",
        tags: ["Fields"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["type", "title"],
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  required: { type: "boolean" },
                  variable: { type: "string" },
                  config: { type: "object" },
                  logic: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { type: "object", properties: { field: { $ref: "#/components/schemas/Field" } } } } } },
        },
      },
    },
    "/forms/{id}/fields/reorder": {
      post: {
        summary: "Reorder fields",
        operationId: "reorderFields",
        tags: ["Fields"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fields: { type: "array", items: { type: "object", properties: { id: { type: "string" }, position: { type: "integer" } } } },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/forms/{id}/fields/{fieldId}": {
      patch: {
        summary: "Update a field",
        operationId: "updateField",
        tags: ["Fields"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "fieldId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  required: { type: "boolean" },
                  position: { type: "integer" },
                  variable: { type: "string" },
                  config: { type: "object" },
                  logic: { type: "array", items: { type: "object" } },
                  question_group_id: { type: "string", format: "uuid", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { field: { $ref: "#/components/schemas/Field" } } } } } },
        },
      },
      delete: {
        summary: "Delete a field",
        operationId: "deleteField",
        tags: ["Fields"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "fieldId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { "204": { description: "Deleted" } },
      },
    },

    // ── Responses ────────────────────────────────────────────────────────────
    "/forms/{id}/responses": {
      get: {
        summary: "List responses",
        operationId: "listResponses",
        tags: ["Responses"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    responses: { type: "array", items: { $ref: "#/components/schemas/Response" } },
                    pagination: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/forms/{id}/responses/{responseId}": {
      delete: {
        summary: "Delete a response",
        operationId: "deleteResponse",
        tags: ["Responses"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "responseId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { "204": { description: "Deleted" } },
      },
    },

    // ── Sessions (public — no auth) ──────────────────────────────────────────
    "/forms/{id}/sessions": {
      post: {
        summary: "Create a form session",
        operationId: "createSession",
        tags: ["Sessions"],
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  device_type: { type: "string", enum: ["mobile", "tablet", "desktop"] },
                  referrer: { type: "string" },
                  metadata: { type: "object" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: { "application/json": { schema: { type: "object", properties: { session_id: { type: "string", format: "uuid" } } } } },
          },
          "404": { description: "Form not found or not published" },
        },
      },
    },
    "/forms/{id}/sessions/{sessionId}/assign": {
      post: {
        summary: "Get variant assignments for a session",
        operationId: "assignVariants",
        tags: ["Sessions"],
        security: [],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "sessionId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "OK — idempotent, safe to call multiple times for the same session",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    assignments: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question_group_id: { type: "string", format: "uuid" },
                          variant_id: { type: "string", format: "uuid" },
                          variant: {
                            type: "object",
                            properties: {
                              title: { type: "string" },
                              description: { type: "string" },
                              type: { type: "string" },
                              config: { type: "object" },
                              logic: { type: "array", items: { type: "object" } },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/sessions/{sessionId}": {
      patch: {
        summary: "Mark a session as complete",
        operationId: "completeSession",
        tags: ["Sessions"],
        security: [],
        parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { completed_at: { type: "string", format: "date-time" } } },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/sessions/{sessionId}/events": {
      post: {
        summary: "Track question events",
        operationId: "trackEvents",
        tags: ["Sessions"],
        security: [],
        parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["events"],
                properties: {
                  events: {
                    type: "array",
                    maxItems: 50,
                    items: {
                      type: "object",
                      required: ["event_type"],
                      properties: {
                        variant_id: { type: "string", format: "uuid" },
                        field_id: { type: "string", format: "uuid" },
                        event_type: {
                          type: "string",
                          enum: ["shown", "answered", "skipped", "abandoned", "backtracked", "validation_error"],
                        },
                        duration_ms: { type: "integer" },
                        metadata: { type: "object" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { "204": { description: "Accepted" } },
      },
    },

    // ── Question Groups ───────────────────────────────────────────────────────
    "/forms/{id}/groups": {
      get: {
        summary: "List question groups",
        operationId: "listGroups",
        tags: ["Experiments"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { groups: { type: "array", items: { $ref: "#/components/schemas/QuestionGroup" } } } } } } },
        },
      },
      post: {
        summary: "Create a question group",
        operationId: "createGroup",
        tags: ["Experiments"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["label"],
                properties: {
                  label: { type: "string" },
                  optimization_goal: { type: "string", enum: ["completion_rate", "answer_time", "composite"] },
                  strategy: { type: "string", enum: ["epsilon_greedy", "equal"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { type: "object", properties: { group: { $ref: "#/components/schemas/QuestionGroup" } } } } } },
        },
      },
    },
    "/forms/{id}/groups/{groupId}": {
      patch: {
        summary: "Update a question group",
        operationId: "updateGroup",
        tags: ["Experiments"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "groupId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  optimization_goal: { type: "string" },
                  strategy: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { group: { $ref: "#/components/schemas/QuestionGroup" } } } } } },
        },
      },
      delete: {
        summary: "Delete a question group",
        operationId: "deleteGroup",
        tags: ["Experiments"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "groupId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { "204": { description: "Deleted" } },
      },
    },

    // ── Variants ─────────────────────────────────────────────────────────────
    "/forms/{id}/groups/{groupId}/variants": {
      get: {
        summary: "List variants",
        operationId: "listVariants",
        tags: ["Experiments"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "groupId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { variants: { type: "array", items: { $ref: "#/components/schemas/QuestionVariant" } } } } } } },
        },
      },
      post: {
        summary: "Create a variant",
        operationId: "createVariant",
        tags: ["Experiments"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "groupId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["variant_label", "title", "type"],
                properties: {
                  variant_label: { type: "string" },
                  title: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  config: { type: "object" },
                  logic: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { type: "object", properties: { variant: { $ref: "#/components/schemas/QuestionVariant" } } } } } },
        },
      },
    },
    "/forms/{id}/groups/{groupId}/variants/{variantId}": {
      patch: {
        summary: "Update a variant",
        operationId: "updateVariant",
        tags: ["Experiments"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "groupId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "variantId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  variant_label: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string" },
                  config: { type: "object" },
                  logic: { type: "array", items: { type: "object" } },
                  is_active: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { variant: { $ref: "#/components/schemas/QuestionVariant" } } } } } },
        },
      },
      delete: {
        summary: "Delete a variant",
        operationId: "deleteVariant",
        tags: ["Experiments"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "groupId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "variantId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "204": { description: "Deleted" },
          "400": { description: "Cannot delete the last active variant", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/forms/{id}/groups/{groupId}/reset-weights": {
      post: {
        summary: "Reset all variant weights to equal distribution",
        operationId: "resetWeights",
        tags: ["Experiments"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "groupId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { variants: { type: "array", items: { $ref: "#/components/schemas/QuestionVariant" } } } } } } },
        },
      },
    },
    "/forms/{id}/groups/{groupId}/analytics": {
      get: {
        summary: "Get per-variant analytics for a question group",
        operationId: "getGroupAnalytics",
        tags: ["Experiments"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "groupId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    variants: { type: "array", items: { $ref: "#/components/schemas/VariantAnalytics" } },
                    last_optimized_at: { type: "string", format: "date-time", nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export function GET() {
  return Response.json(spec, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
