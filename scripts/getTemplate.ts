import { ComfyApi } from "@saintno/comfyui-sdk";
import { toApiPromptStrict } from "./graph-to-prompt-strict";

async function main() {
  const api = new ComfyApi("http://localhost:8000");

  const list = await api.fetchApi("/templates/image2image.json");
  const workflow = await list.json();
  console.log(workflow);

  const apiPrompt = await toApiPromptStrict(workflow, {
    baseUrl: "http://localhost:8000",
  });

  console.log(apiPrompt);
}

main();
