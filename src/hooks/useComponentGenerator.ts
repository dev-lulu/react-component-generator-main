import { useState, useCallback, useEffect } from 'react';
import type { GeneratedComponent, Provider } from '../types';

const STORAGE_KEY = 'generated-components';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<GeneratedComponent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return (JSON.parse(stored) as Array<Record<string, unknown>>).map((c) => ({
        ...(c as Omit<GeneratedComponent, 'createdAt'>),
        createdAt: new Date(c.createdAt as string),
      }));
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const placeholder: GeneratedComponent = {
      id,
      prompt,
      code: '',
      createdAt: new Date(),
      isStreaming: true,
      streamingText: '',
    };
    setComponents((prev) => [placeholder, ...prev]);

    try {
      const res = await fetch('/api/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate component');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop()!;

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            try {
              const payload = JSON.parse(raw);

              if (currentEvent === 'chunk') {
                setComponents((prev) =>
                  prev.map((c) =>
                    c.id === id
                      ? { ...c, streamingText: (c.streamingText ?? '') + payload.text }
                      : c
                  )
                );
              } else if (currentEvent === 'done') {
                setComponents((prev) =>
                  prev.map((c) =>
                    c.id === id
                      ? {
                          ...c,
                          code: payload.code,
                          isStreaming: false,
                          streamingText: undefined,
                        }
                      : c
                  )
                );
              } else if (currentEvent === 'error') {
                throw new Error(payload.message);
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && currentEvent === 'error') {
                throw parseErr;
              }
            }
            currentEvent = '';
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setComponents((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setIsLoading(false);
      setComponents((prev) =>
        prev.map((c) =>
          c.id === id && c.isStreaming
            ? { ...c, isStreaming: false, streamingText: undefined }
            : c
        )
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(components));
  }, [components]);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  return { components, isLoading, error, generate, removeComponent, clearAll };
}
