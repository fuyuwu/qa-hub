import { defineRailway, github, project, service } from "railway/iac";

export default defineRailway(() => {
  const api = service("api", {
    source: github("fuyuwu/qa-hub", { branch: "main" }),
    build: "npm ci && npm run build",
    start: "npm run start",
    healthcheck: "/health",
  });

  const web = service("web", {
    source: github("fuyuwu/qa-hub", { branch: "main", rootDirectory: "client" }),
    build: "npm ci && npm run build",
    start: "npm run start",
  });

  return project("qa-hub", {
    resources: [api, web],
  });
});
