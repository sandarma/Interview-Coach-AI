const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function getTopics(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/topics`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message =
      (data as { error?: string }).error ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const data: unknown = await response.json();
  return data as string[];
}
