const HOSTED_API_URL = "https://budgetbounder.somee.com/api";

export function resolveWebApiUrl(configuredUrl?: string) {
  return (configuredUrl?.trim() || HOSTED_API_URL).replace(/\/$/, "");
}
