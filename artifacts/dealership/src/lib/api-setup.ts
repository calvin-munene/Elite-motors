import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

// Set base URL for API requests if needed
// setBaseUrl("http://localhost:3000");

// Automatically attach adminToken from localStorage
setAuthTokenGetter(() => {
  return localStorage.getItem("adminToken");
});
