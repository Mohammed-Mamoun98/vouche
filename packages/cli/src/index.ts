#!/usr/bin/env node
import { checkCommand } from "./commands/check";
import { initCommand } from "./commands/init";
import { loginCommand, whoamiCommand, logoutCommand } from "./commands/login";

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "check":
      await checkCommand();
      break;
    case "init":
      await initCommand();
      break;
    case "login":
      await loginCommand();
      break;
    case "whoami":
      whoamiCommand();
      break;
    case "logout":
      logoutCommand();
      break;
    default:
      console.log("Usage: vouch <command>");
      console.log("");
      console.log("Commands:");
      console.log("  check    Run the audit on the last commit");
      console.log("  init     Install pre-push hook and create .vouchrc");
      console.log("  login    Set up API keys and credentials");
      console.log("  whoami   Show current auth state");
      console.log("  logout   Remove stored credentials");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`vouch: ${err.message}`);
  process.exit(0); // Never block a push due to a Vouch bug
});
