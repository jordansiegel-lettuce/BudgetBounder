export function resolveApiUrl(
  platform: string,
  configuredUrl?: string,
  expoHostUri?: string,
) {
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const expoHost = expoHostUri?.split(':')[0];
  if (expoHost) return `http://${expoHost}:5292/api`;

  return platform === 'android'
    ? 'http://10.0.2.2:5292/api'
    : 'http://localhost:5292/api';
}
