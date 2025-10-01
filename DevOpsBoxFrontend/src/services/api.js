const API_BASE = "/api";

/**
 * Handles error responses for all API calls.
 * Attempts to extract detailed error text for better debugging.
 * @param {Response} response The fetch Response object.
 * @returns {Promise<never>} Throws an Error.
 */
async function handleErrorResponse(response, action) {
  // Read the response body for detailed server error message
  const errorText = await response.text();
  
  // Construct a detailed error message
  const errorMessage = `${action} failed: ${response.status} ${response.statusText} - ${errorText}`;
  throw new Error(errorMessage);
}


export async function fetchChallenges() {
  const response = await fetch(`${API_BASE}/challenges`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    return handleErrorResponse(response, "Failed to fetch challenges");
  }
  
  const data = await response.json();
  if (!Array.isArray(data)) {
      // Assuming the backend should return an array, this handles unexpected structure
      throw new Error("Invalid response format for challenges: Expected an array.");
  }
  return data;
}

export async function fetchChallengeById(id) {
  const response = await fetch(`${API_BASE}/challenges/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    return handleErrorResponse(response, `Failed to fetch challenge details for ID ${id}`);
  }
  return response.json();
}

export async function startChallenge(id) {
  const response = await fetch(`${API_BASE}/start/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // No body needed for a simple trigger command
  });

  if (!response.ok) {
    return handleErrorResponse(response, `Failed to start challenge environment for ID ${id}`);
  }
  
  // Return the result of the setup script execution (e.g., success message)
  return response.json();
}

// NEW: Function to fetch challenge statistics
export async function fetchStats() {
    const response = await fetch(`${API_BASE}/stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
        return handleErrorResponse(response, "Failed to fetch challenge statistics");
    }
    return response.json();
}
export async function validateChallenge(id) {
  const response = await fetch(`/api/validate/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Validation failed: ${response.status} ${errorText}`);
  }

  return response.json();
}
export async function runCommand(command) {
  const response = await fetch("/api/run-command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Command failed: ${response.status} ${text}`);
  }
  return response.json();
}
export async function readFile(path) {
  try {
    const res = await fetch(`/api/read-file?path=${encodeURIComponent(path)}`);
    // Note: The backend returns 404/400 for errors, but the response structure is always JSON.
    const data = await res.json();
    return data; 
  } catch (error) {
    // Handle network errors
    return { error: `Network error: ${error.message}` };
  }
}
export async function editFile(path, content) {
  try {
    const res = await fetch("/api/edit-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content }),
    });
    // The backend handles the status codes, we just return the JSON result
    const data = await res.json();
    return data;
  } catch (error) {
    // Handle network errors
    return { error: `Network error: ${error.message}` };
  }
}
export async function resetChallenge(id) {
  const response = await fetch(`/api/reset/${id}`, { method: "POST" });
  if (!response.ok) throw new Error("Failed to reset challenge");
  return response.json();
}

