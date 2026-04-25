import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  jsonb,
  unique,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

// ---- Better Auth tables ----

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ---- Domain tables ----

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  plan: text("plan", {
    enum: ["trialing", "professional", "business", "enterprise"],
  })
    .notNull()
    .default("trialing"),
  trialStartedAt: timestamp("trial_started_at").defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "admin", "member"] }).notNull(),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.workspaceId, t.userId),
    index("idx_wm_workspace").on(t.workspaceId),
    index("idx_wm_user").on(t.userId),
  ]
);

export const workspaceInvites = pgTable(
  "workspace_invites",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name"),
    role: text("role", { enum: ["admin", "member"] }).notNull().default("member"),
    token: text("token").notNull().unique(),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id),
    invitedAt: timestamp("invited_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    acceptedBy: text("accepted_by").references(() => user.id),
  },
  (t) => [
    index("idx_invites_workspace").on(t.workspaceId),
    index("idx_invites_email").on(t.email),
    index("idx_invites_token").on(t.token),
  ]
);

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  fullName: text("full_name"),
  companyName: text("company_name"),
  phone: text("phone"),
  defaultWorkspaceId: text("default_workspace_id"),
});

export const icpProfiles = pgTable("icp_profiles", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .unique()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  companyName: text("company_name"),
  senderName: text("sender_name"),
  yourIndustry: text("your_industry"),
  whatYouSell: text("what_you_sell"),
  targetIndustries: text("target_industries"),
  companySize: text("company_size"),
  minRevenue: text("min_revenue"),
  targetRegion: text("target_region"),
  problemYouSolve: text("problem_you_solve"),
  decisionMakerTitle: text("decision_maker_title"),
  decisionMakerDept: text("decision_maker_dept"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const savedLists = pgTable(
  "saved_lists",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    filters: jsonb("filters").default({}),
    filterLabels: text("filter_labels"),
    companies: jsonb("companies").default([]),
    totalResults: integer("total_results").default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("idx_lists_workspace").on(t.workspaceId)]
);

export const pipelineItems = pgTable(
  "pipeline_items",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    orgNumber: text("org_number").notNull(),
    stageId: text("stage_id", {
      enum: ["new", "contacted", "meeting", "contract", "won", "lost"],
    }).notNull(),
    movedAt: timestamp("moved_at").defaultNow(),
    name: text("name"),
    industry: text("industry"),
    contactName: text("contact_name"),
    email: text("email"),
    phone: text("phone"),
    municipality: text("municipality"),
    notes: jsonb("notes").default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.workspaceId, t.orgNumber),
    index("idx_pipeline_workspace").on(t.workspaceId),
    index("idx_pipeline_stage").on(t.workspaceId, t.stageId),
  ]
);

export const contactTracking = pgTable(
  "contact_tracking",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    orgNumber: text("org_number").notNull(),
    emailed: boolean("emailed").default(false),
    emailedAt: timestamp("emailed_at"),
    called: boolean("called").default(false),
    calledAt: timestamp("called_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.workspaceId, t.orgNumber),
    index("idx_tracking_workspace").on(t.workspaceId),
  ]
);

export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    orgNumber: text("org_number"),
    name: text("name").notNull(),
    contactName: text("contact_name"),
    contactRole: text("contact_role"),
    email: text("email"),
    phone: text("phone"),
    industry: text("industry"),
    municipality: text("municipality"),
    revenue: bigint("revenue", { mode: "number" }),
    notes: text("notes"),
    status: text("status").default("won"),
    wonDate: timestamp("won_date").defaultNow(),
    contracts: jsonb("contracts").default([]),
    notesLog: jsonb("notes_log").default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("idx_customers_workspace").on(t.workspaceId)]
);

export const emailTemplates = pgTable(
  "email_templates",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull().default("Untitled"),
    subject: text("subject"),
    body: text("body"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("idx_templates_workspace").on(t.workspaceId)]
);

export const usageCounters = pgTable(
  "usage_counters",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    monthKey: text("month_key").notNull(),
    enrichments: integer("enrichments").default(0),
    emailsSent: integer("emails_sent").default(0),
    phonesViewed: integer("phones_viewed").default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.workspaceId, t.monthKey),
    index("idx_usage_workspace").on(t.workspaceId),
  ]
);
