/**
 * Dev-only fixtures for the mock API. Everything here is obviously fake:
 * test server names, placeholder numbers (1234, 56 ...) and snowflake-shaped
 * IDs made of zeros. Never surface these as real usage figures.
 */
import type {
  Automation,
  AutomodConfig,
  GuildSettings,
  JoinGatesConfig,
  PleedServer,
  PleedStats,
  SecurityConfig,
} from "@/lib/api/types";

export interface MockDb {
  stats: PleedStats;
  servers: PleedServer[];
  security: SecurityConfig;
  joingates: JoinGatesConfig;
  automod: AutomodConfig;
  automations: Automation[];
  settings: GuildSettings;
}

/** Fake channel / role IDs (snowflake-shaped, clearly not real). */
export const MOCK_IDS = {
  verifyChannel: "200000000000000001",
  logChannel: "200000000000000002",
  welcomeChannel: "200000000000000003",
  verifiedRole: "300000000000000001",
  unverifiedRole: "300000000000000002",
} as const;

function populated(): MockDb {
  return {
    stats: { servers: 3, messages_today: 1234, actions_taken: 56 },
    servers: [
      { id: "100000000000000001", name: "Pleed Test Server", role: "Owner", members: 128 },
      { id: "100000000000000002", name: "Pleed Sandbox", role: "Administrator", members: 42 },
      {
        id: "100000000000000003",
        name: "Pleed Staging Server With A Deliberately Long Name For Layout Testing",
        role: "Manage Server",
        members: 1024,
      },
    ],
    security: {
      enabled: 1,
      punishment: "ban",
      ban_threshold: 3,
      kick_threshold: 5,
      channel_delete_threshold: 2,
      role_delete_threshold: 2,
    },
    joingates: {
      enabled: 1,
      verify_channel_id: MOCK_IDS.verifyChannel,
      verified_role_id: MOCK_IDS.verifiedRole,
      unverified_role_id: MOCK_IDS.unverifiedRole,
      min_account_age_days: 7,
      auto_kick_minutes: 30,
      dm_on_join: 1,
      log_channel_id: MOCK_IDS.logChannel,
      bypass_role_id: "",
    },
    automod: {
      anti_links: 1,
      anti_spam: 1,
      anti_caps: 0,
      anti_invites: 1,
      anti_mentions: 0,
      bad_words_enabled: 0,
      punishment: "timeout",
      timeout_minutes: 10,
    },
    automations: [
      { id: 1, name: "", trigger: "hello", payload: "Hi there! (mock auto-responder)", match_type: "contains" },
      { id: 2, name: "", trigger: "rules", payload: "Please read the rules channel before posting.", match_type: "contains" },
      {
        id: 3,
        name: "",
        trigger: "averyveryverylongtriggerwordwithoutanyspacestotestwrapping",
        payload:
          "A deliberately long reply to check that wrapping works on small screens. It keeps going for a while so the card has to handle two or three lines of text.",
        match_type: "contains",
      },
    ],
    settings: { prefix: "!", welcome_channel: MOCK_IDS.welcomeChannel },
  };
}

/** A server Pleed has just joined: nothing configured yet. */
function empty(): MockDb {
  return {
    stats: { servers: 0, messages_today: 0, actions_taken: 0 },
    servers: [],
    security: {
      enabled: 0,
      punishment: "ban",
      ban_threshold: 3,
      kick_threshold: 5,
      channel_delete_threshold: 2,
      role_delete_threshold: 2,
    },
    joingates: {
      enabled: 0,
      verify_channel_id: "",
      verified_role_id: "",
      unverified_role_id: "",
      min_account_age_days: 0,
      auto_kick_minutes: 0,
      dm_on_join: 0,
      log_channel_id: "",
      bypass_role_id: "",
    },
    automod: {
      anti_links: 0,
      anti_spam: 0,
      anti_caps: 0,
      anti_invites: 0,
      anti_mentions: 0,
      bad_words_enabled: 0,
      punishment: "delete",
      timeout_minutes: 10,
    },
    automations: [],
    settings: { prefix: "!", welcome_channel: null },
  };
}

export type MockDbVariant = "populated" | "empty";

/** A fresh, independent copy of the fixtures. */
export function createMockDb(variant: MockDbVariant): MockDb {
  return variant === "empty" ? empty() : populated();
}
