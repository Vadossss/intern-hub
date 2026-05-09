export type ResumeMode = "view" | "create" | "edit";
export type ResumeConfirmAction = "archive" | "delete";
export type ResumeFieldName =
  | "profession"
  | "experienceId"
  | "employmentId"
  | "workFormatId"
  | "about"
  | "skillIds";
export type ResumeFormErrors = Partial<Record<ResumeFieldName, string>>;
