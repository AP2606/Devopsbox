const API_BASE = "/api";

export const getChallenges = async () => {
  const res = await fetch(`${API_BASE}/challenges`);
  return res.json();
};
