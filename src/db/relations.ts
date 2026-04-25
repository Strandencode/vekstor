import { relations } from "drizzle-orm";
import {
  user,
  workspaces,
  workspaceMembers,
  workspaceInvites,
  profiles,
  icpProfiles,
  savedLists,
  pipelineItems,
  contactTracking,
  customers,
  emailTemplates,
  usageCounters,
} from "./schema";

export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(profiles, { fields: [user.id], references: [profiles.userId] }),
  workspaceMembers: many(workspaceMembers),
  ownedWorkspaces: many(workspaces),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(user, { fields: [workspaces.ownerId], references: [user.id] }),
  members: many(workspaceMembers),
  invites: many(workspaceInvites),
  icpProfile: one(icpProfiles),
  savedLists: many(savedLists),
  pipelineItems: many(pipelineItems),
  customers: many(customers),
  emailTemplates: many(emailTemplates),
  usageCounters: many(usageCounters),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(user, { fields: [workspaceMembers.userId], references: [user.id] }),
}));

export const workspaceInvitesRelations = relations(workspaceInvites, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceInvites.workspaceId],
    references: [workspaces.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(user, { fields: [profiles.userId], references: [user.id] }),
}));
