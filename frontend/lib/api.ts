const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function sendMessage(message: string): Promise<string> {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Something went wrong");
  }

  const data = await response.json();
  return data.reply;
}

export async function loadHistory(): Promise<{ role: string; text: string }[]> {
  const response = await fetch(`${API_URL}/history`);

  if (!response.ok) throw new Error("Failed to load history");

  const data = await response.json();
  return data.messages;
}