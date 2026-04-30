#!/usr/bin/env node
import { checkCommand } from "./commands/check";

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "check":
      await checkCommand();
      break;
    default:
      console.log("Usage: vouch <command>");
      console.log("");
      console.log("Commands:");
      console.log("  check    Run the audit on the last commit");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`vouch: ${err.message}`);
  process.exit(0); // Never block a push due to a Vouch bug
});
