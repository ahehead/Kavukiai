import { ComfyApi } from "@saintno/comfyui-sdk";
import { toApiPromptStrict } from "../src/main/ipc/ComfyUI/graph-to-prompt-strict.ts";
import sampleJson from "../src/resources/build/sample/default_api.json";

async function main() {
  const api = new ComfyApi("http://localhost:8000");

  const list = await api.fetchApi("/templates/default.json");
  const target = await list.json();
  console.log("target workflow json : \n", JSON.stringify(target, null, 2));

  const apiPrompt = await toApiPromptStrict(target, {
    baseUrl: "http://localhost:8000",
  });

  console.log(
    "workflow prompt version : \n",
    JSON.stringify(apiPrompt, null, 2)
  );
  console.log("参考 workflow json : \n", JSON.stringify(sampleJson, null, 2));
}

main();
