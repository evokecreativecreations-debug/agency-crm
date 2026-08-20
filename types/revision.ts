/**
 * Mirrors the "revisions" table — see CRM_Blueprint_v2.md, Section 3.
 * Note: the frozen schema uses round_number + a single feedback field
 * (not revision_number/title/notes), and only requested/in_progress/
 * resolved statuses with just created_at — no requested_at/completed_at/
 * updated_at columns.
 */

export type RevisionStatus = "requested" | "in_progress" | "resolved";

export interface Revision {
  id: string;
  project_id: string;
  round_number: number;
  feedback: string;
  status: RevisionStatus;
  created_at: string;
}

/** Fields required to create a revision. round_number is computed
 * automatically by createRevision (next number for that project) — not
 * supplied by the caller. */
export interface NewRevisionInput {
  project_id: string;
  feedback: string;
}

/** Fields that can be changed after a revision is created. */
export type UpdateRevisionInput = Partial<Pick<Revision, "feedback" | "status">>;