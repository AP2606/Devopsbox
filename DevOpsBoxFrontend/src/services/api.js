const API_BASE = "/api";

export async function fetchChallenges() {
  const response = await fetch(`${API_BASE}/challenges`);
  if (!response.ok) throw new Error("Failed to fetch challenges");
  return response.json();
}

export async function fetchChallengeById(id) {
  const response = await fetch(`${API_BASE}/challenges/${id}`);
  if (!response.ok) throw new Error("Failed to fetch challenge");
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
    const errorText = await response.text();
    throw new Error(`Failed to start challenge: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  // Return the result of the setup script execution (e.g., success message)
  return response.json();
}
