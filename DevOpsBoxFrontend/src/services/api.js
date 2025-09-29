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

