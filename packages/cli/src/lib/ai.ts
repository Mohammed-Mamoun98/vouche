import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { VouchConfig } from "@vouch/shared";

export interface AIAdapter {
  chat(
    messages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }>,
  ): Promise<string>;
}

interface Credentials {
  openrouter_key?: string;
  anthropic_key?: string;
}

function getCredentialsPath(): string {
  return path.join(os.homedir(), ".vouch", "credentials");
}

export function getApiKey(provider: string): string {
  if (provider === "ollama") return "";

  const credPath = getCredentialsPath();
  let creds: Credentials;

  try {
    const content = readFileSync(credPath, "utf-8");
    creds = JSON.parse(content);
  } catch {
    throw new Error(
      `API key not found for ${provider}. Run 'vouch login' to authenticate.`,
    );
  }

  if (provider === "openrouter" && creds.openrouter_key) {
    return creds.openrouter_key;
  }
  if (provider === "anthropic" && creds.anthropic_key) {
    return creds.anthropic_key;
  }

  throw new Error(
    `API key not found for ${provider}. Run 'vouch login' to authenticate.`,
  );
}

async function openrouterChat(
  model: string,
  apiKey: string,
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>,
): Promise<string> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `OpenRouter API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}

async function ollamaChat(
  baseUrl: string,
  model: string,
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>,
): Promise<string> {
  const url = `${baseUrl}/api/chat`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as { message: { content: string } };
  return data.message?.content ?? "";
}

async function anthropicChat(
  model: string,
  apiKey: string,
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>,
): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system");
  const otherMessages = messages.filter((m) => m.role !== "system");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemMsg?.content,
      messages: otherMessages,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Anthropic API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as { content: Array<{ text: string }> };
  return data.content[0]?.text ?? "";
}

export function createAdapter(config: VouchConfig, apiKey?: string): AIAdapter {
  const key = apiKey ?? getApiKey(config.provider);

  if (config.provider === "openrouter") {
    return {
      async chat(messages) {
        return openrouterChat(config.model, key, messages);
      },
    };
  }

  if (config.provider === "ollama") {
    const baseUrl = config.base_url ?? "http://localhost:11434";
    return {
      async chat(messages) {
        return ollamaChat(baseUrl, config.model, messages);
      },
    };
  }

  if (config.provider === "anthropic") {
    return {
      async chat(messages) {
        return anthropicChat(config.model, key, messages);
      },
    };
  }

  throw new Error(`Unsupported provider: ${config.provider}`);
}
