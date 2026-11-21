export const LOCAL_FRONTEND_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

export function parseConfiguredOrigins(frontendUrl = process.env.FRONTEND_URL) {
  return String(frontendUrl || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export function allowedFrontendOrigins(frontendUrl = process.env.FRONTEND_URL) {
  return [...new Set([...LOCAL_FRONTEND_ORIGINS, ...parseConfiguredOrigins(frontendUrl)])];
}

export function corsOriginDelegate(allowedOrigins = allowedFrontendOrigins()) {
  return function origin(requestOrigin, callback) {
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  };
}
