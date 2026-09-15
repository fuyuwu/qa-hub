import { defineRailway, github, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const apiVolume = volume("api-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "ams", sizeMB: 500 });
  const api = service("api", {
    source: github("fuyuwu/qa-hub"),
    build: "npm run build",
    start: "npm run start",
    healthcheck: "/health",
    replicas: { "ams": 1 },
    volumeMounts: { "/data": apiVolume },
    env: { API_KEY: preserve(), DATABASE_URL: preserve() },
  });
  const web = service("web", {
    source: github("fuyuwu/qa-hub", { rootDirectory: "client" }),
    build: "npm run build",
    start: "npm run start",
    replicas: { "ams": 1 },
    env: { VITE_API_BASE_URL: "https://api-production-48d8d.up.railway.app" },
  });

  return project("qa-hub", {
    resources: [api, web, apiVolume],
  });
});
