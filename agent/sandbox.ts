// Runs the agent's code tools in a local Docker container on our server, instead of Vercel Sandbox.
import { installCodeTooling } from "eve/extensions/code/sandbox";
import { defineSandbox } from "eve/sandbox";
import { DockerSandbox } from "eve/sandbox/docker";

export const environment = DockerSandbox.environment({
  prepare: (sandbox) => installCodeTooling(sandbox),
});

export default defineSandbox(() => environment.open({ networkPolicy: "deny-all" }));
