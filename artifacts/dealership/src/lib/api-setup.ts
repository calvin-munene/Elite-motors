import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

// In production on external hosts (Render/Railway/VPS), set VITE_API_URL
// to the full API server URL if frontend and backend are separate services.
// If they are the same service (recommended), leave it unset — relative /api/ paths work.
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

// Automatically attach adminToken from localStorage for admin API calls
setAuthTokenGetter(() => {
  return localStorage.getItem("adminToken");
});
