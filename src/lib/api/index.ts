// Pleed API client. Hooks live in "@/lib/api/hooks" (client components only).
export { LOCALHOSTRUN_API_BASE, LOCALTUNNEL_API_BASE, MOCK_GUILD_ID } from "./config";
export { ApiError, isAbortError, isApiError, toApiError } from "./errors";
export type { ApiErrorInit, ApiErrorKind } from "./errors";
export { flagOn, toFlag } from "./flag";
export {
  createAutomation,
  deleteAutomation,
  getAutomations,
  getAutomodConfig,
  getJoinGatesConfig,
  getSecurityConfig,
  getServers,
  getSettings,
  getStats,
  pleedRequests,
  saveAutomodConfig,
  saveJoinGatesConfig,
  saveSecurityConfig,
  saveSettings,
} from "./pleed";
export type * from "./types";
