import { getStoredSession } from "@/lib/auth-session";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  error?: string; // set when the assistant failed to reply
}

export const MAX_INPUT_LENGTH = 1000;
const MAX_HISTORY = 12; // only the latest messages are sent, to keep requests small and cheap
const ENDPOINT = "/ai/chat"; // <- change if your backend route is different

export class ChatApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const isAbortError = (err: unknown) => err instanceof DOMException && err.name === "AbortError";

// Only a valid, unexpired STUDENT token is ever sent. Admin tokens never are.
function getStudentToken() {
  if (!getStoredSession()) return null;
  return localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
}

/**
 * Sends the conversation to the backend and reports the reply as it arrives.
 * Supports both reply styles (see AI-CHAT-API.md):
 *   1. JSON            -> { "reply": "..." }
 *   2. Streamed text   -> plain text chunks (shown word by word)
 * `onText` always receives the full reply so far.
 */
export async function streamChat({
  messages,
  signal,
  onText,
}: {
  messages: ChatMessage[];
  signal: AbortSignal;
  onText: (textSoFar: string) => void;
}): Promise<string> {
  const payload = messages
    .filter((m) => !m.error && m.content.trim())
    .slice(-MAX_HISTORY)
    .map(({ role, content }) => ({ role, content }));

  const post = async (token: string | null) => {
    try {
      return await fetch(`${process.env.NEXT_PUBLIC_API_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: payload }),
        signal,
      });
    } catch (err) {
      if (isAbortError(err)) throw err;
      throw new ChatApiError("Could not reach the assistant. Check your connection and try again.", 0);
    }
  };

  const token = getStudentToken();
  let response = await post(token);

  // A stale token shouldn't lock someone out of the public assistant: retry anonymously
  if (response.status === 401 && token) response = await post(null);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const serverMessage: string | undefined = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new ChatApiError(
      response.status === 429
        ? "You're sending messages too quickly. Please wait a moment and try again."
        : serverMessage || "The assistant is unavailable right now. Please try again later.",
      response.status
    );
  }

  // Style 1: a normal JSON reply
  if ((response.headers.get("content-type") ?? "").includes("application/json")) {
    const body = await response.json().catch(() => null);
    const reply = body?.reply ?? body?.data?.reply;
    if (typeof reply !== "string") {
      throw new ChatApiError("The assistant sent an unexpected response.", response.status);
    }
    onText(reply);
    return reply;
  }

  // Style 2: streamed plain text
  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    onText(text);
    return text;
  }

  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onText(full);
  }
  full += decoder.decode();
  onText(full);
  return full;
}