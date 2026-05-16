const API_URL = "http://localhost:5000/api";

export async function checkBackendHealth() {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}