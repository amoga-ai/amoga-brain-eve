// Builds a json-render card from a short answer. Uses only Card and Text, which the sales app knows how to draw.
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  label: { start: () => "Preparing card", complete: () => "Prepared card" },
  description:
    "Show a short answer as a card in the chat, for facts a person should see at a glance, such as a price or a policy step. " +
    "Pass a title, the text, and the file name it came from. Longer or conversational answers stay as normal text.",
  inputSchema: z.object({
    title: z.string().min(1).max(80).describe("Short heading for the card"),
    text: z.string().min(1).max(600).describe("The answer text, using only facts from the documents"),
    source: z.string().max(120).optional().describe("The file name the answer came from"),
  }),
  async execute({ title, text, source }) {
    const children = ["body"];
    const elements: Record<string, unknown> = {
      card: { type: "Card", props: { title }, children },
      body: { type: "Text", props: { content: text } },
    };
    if (source) {
      children.push("source");
      elements.source = { type: "Text", props: { content: `Source: ${source}` } };
    }
    return { spec: { root: "card", elements } };
  },
});