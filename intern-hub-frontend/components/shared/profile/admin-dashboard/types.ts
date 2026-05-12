import type { AdminSection } from "../types";

export type AdminWorkspaceSection = Exclude<AdminSection, "settings">;
