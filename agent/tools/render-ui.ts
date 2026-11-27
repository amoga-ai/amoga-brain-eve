// Builds a json-render screen from the standard components the sales app can draw. Unknown component types are refused.
import { defineTool } from "eve/tools";
import { z } from "zod";

const COMPONENTS = [
  "Card", "Grid", "Text", "Button", "MetricCard", "Table", "DonutChart", "ScatterChart", "StoryCard",
] as const;

export default defineTool({
  label: { start: () => "Preparing screen", complete: () => "Prepared screen" },
  description:
    "Show an answer as a visual screen in the chat. Build a flat spec: a root element id, and elements keyed by id. " +
    "Each element has a type from this list, props, and optional children (element ids). Components: " +
    "Card {title} (a panel; holds children); Grid {columns: 2|3|4} (lays out children); " +
    "Text {content} (a line of text); Button {label, actionId} (display only for now); " +
    "MetricCard {label, value} (one key number); Table {title, columns: string[], rows: string[][]}; " +
    "DonutChart {title, labels: string[], values: number[]}; ScatterChart {title, points: [{x, y}]}; " +
    "StoryCard {title, text}. Use only facts from the documents, and add a Text element with the source file name. " +
    "Plain answers stay as normal text.",
  inputSchema: z.object({
    root: z.string().describe("The id of the top element"),
    elements: z
      .record(
        z.string(),
        z.object({
          type: z.enum(COMPONENTS),
          props: z.record(z.string(), z.any()).default({}),
          children: z.array(z.string()).optional(),
        }),
      )
      .describe("Every element, keyed by its id"),
  }),
  async execute({ root, elements }) {
    if (!elements[root]) {
      return { error: `Root element "${root}" is missing from elements.` };
    }
    // Checks that every child id exists, so the sales app never gets a broken reference.
    for (const [id, el] of Object.entries(elements)) {
      for (const child of el.children ?? []) {
        if (!elements[child]) return { error: `Element "${id}" points to missing child "${child}".` };
      }
    }
    return { spec: { root, elements } };
  },
});