// Private notes for each signed-in person, stored on our server in MEMORY_DIR. Channel memory is removed for the AI chat.
import { defineMemory } from "eve/memory";
import { fileMemory } from "eve/memory/file";
import { byPrincipal } from "eve/memory/scope";
import { fileBackend } from "../lib/file-backend.ts";

export default defineMemory({
  description:
    "Your private notes about the person you're talking with: their role, team, projects, and preferences. Only they see conversations that use it.",
  provider: fileMemory({ backend: fileBackend(process.env.MEMORY_DIR ?? "/data/memory") }),
  scope: byPrincipal,
});
