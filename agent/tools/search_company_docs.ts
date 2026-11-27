// Searches the company documents folder for sections that match the question and returns them with their file names.
import { defineTool } from "eve/tools";
import { z } from "zod";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const DOCS_DIR = process.env.COMPANY_DOCS_DIR ?? "/data/company";

export default defineTool({
  label: { start: () => "Searching company documents", complete: () => "Searched company documents" },
  description:
    "Search the company documents folder for sections that match the question. Returns matching sections with their file names. " +
    "Answer only from these sections, and name the file you used. If nothing matches, say so.",
  inputSchema: z.object({
    query: z.string().min(1).max(300).describe("The question or keywords to look for."),
    limit: z.number().int().min(1).max(10).optional().describe("Maximum sections to return. Default 5."),
  }),
  async execute({ query, limit }) {
    // Keeps only words of 3 or more letters, lowercased, so short filler words are ignored.
    const words = query
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length >= 3);

    let files: string[];
    try {
      files = (await readdir(DOCS_DIR)).filter((f) => /\.(md|txt)$/i.test(f));
    } catch {
      return { unavailable: true, message: `The company documents folder could not be read.` };
    }

    // Scores each section by how many query words it contains.
    const hits: { file: string; score: number; excerpt: string }[] = [];
    for (const file of files) {
      const text = await readFile(path.join(DOCS_DIR, file), "utf8");
      for (const section of text.split(/\n(?=#)/)) {
        const lower = section.toLowerCase();
        const score = words.filter((w) => lower.includes(w)).length;
        if (score > 0) hits.push({ file, score, excerpt: section.trim().slice(0, 1200) });
      }
    }

    hits.sort((a, b) => b.score - a.score);
    const top = hits.slice(0, limit ?? 5);
    return { count: top.length, results: top };
  },
});