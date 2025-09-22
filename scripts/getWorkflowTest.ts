import { ComfyApi } from "@saintno/comfyui-sdk";

async function main() {
  const api = new ComfyApi("http://localhost:8000").init();
  const list = await api.listUserData("workflows");
  console.log(list);
  const test = await api.getUserData("workflows/test.json");

  console.log(test);
}

main();
