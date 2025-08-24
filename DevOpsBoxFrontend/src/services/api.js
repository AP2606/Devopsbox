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

