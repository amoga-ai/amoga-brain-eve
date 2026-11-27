// Stores each memory document as a JSON file in a persistent folder, with a version counter so two saves can't overwrite each other.
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { MemoryDocumentConflictError, type MemoryDocumentBackend } from "eve/memory/file";

type Row = { content: string; version: number };

export function fileBackend(dir: string): MemoryDocumentBackend {
  const pathFor = (key: string) => join(dir, `${encodeURIComponent(key)}.json`);
  // Serializes writes per key inside this process, so the version check and the write happen together.
  const queues = new Map<string, Promise<unknown>>();

  async function load(key: string): Promise<Row | null> {
    try {
      return JSON.parse(await readFile(pathFor(key), "utf8")) as Row;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  return {
    async read({ key, signal }) {
      signal.throwIfAborted();
      const row = await load(key);
      return row ? { content: row.content, version: String(row.version) } : null;
    },
    async write({ key, content, expectedVersion, signal }) {
      signal.throwIfAborted();
      const run = async () => {
        const current = await load(key);
        const currentVersion = current ? String(current.version) : null;
        if (currentVersion !== expectedVersion) throw new MemoryDocumentConflictError(key);
        await mkdir(dir, { recursive: true });
        const next: Row = { content, version: (current?.version ?? 0) + 1 };
        const target = pathFor(key);
        await writeFile(`${target}.tmp`, JSON.stringify(next));
        await rename(`${target}.tmp`, target);
        return { content, version: String(next.version) };
      };
      const previous = queues.get(key) ?? Promise.resolve();
      const result = previous.then(run, run);
      queues.set(key, result.catch(() => undefined));
      return result;
    },
  };
}
