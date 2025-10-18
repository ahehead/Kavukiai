import type { StatusInfo } from "./cliService";
import { getStatusViaCli } from "./cliService";

async function main() {
  try {
    const status: StatusInfo | null = await getStatusViaCli();
    if (!status) {
      console.error("Failed to retrieve status. CLI may not be available.");
      process.exit(1);
    }

    console.log("LMStudio Status:");
    console.log(`  Server: ${status.server}`);
    console.log(`  Port: ${status.port ?? "N/A"}`);
    if (status.loadedModels.length > 0) {
      console.log("  Loaded Models:");
      status.loadedModels.forEach((name) => console.log(`    - ${name}`));
    } else {
      console.log("  Loaded Models: None");
    }
  } catch (err) {
    console.error("Error while getting status:", err);
    process.exit(1);
  }
}

main();
