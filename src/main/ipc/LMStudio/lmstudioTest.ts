import { Chat } from "@lmstudio/sdk";
import { findLoadedModel, getLMStudioClient } from "./modelClient";

export async function runLMStudioTest() {
  try {
    const client = await getLMStudioClient();
    const modelKey = "qwen2.5-7b-instruct";

    let model = await findLoadedModel(modelKey);
    if (!model) {
      console.log(`Model ${modelKey} not loaded. Loading...`);
      model = await client.llm.load(modelKey);
      console.log(`Model loaded: ${model.modelKey}`);
    } else {
      console.log(`Using existing loaded model: ${model.modelKey}`);
    }

    const chat = Chat.from([
      { role: "system", content: "You are a resident AI philosopher." },
      { role: "user", content: "What is the meaning of life?" },
    ]);

    console.log("Sending chat and streaming response:");
    const prediction = model.respond(chat, { temperature: 0.6, maxTokens: 50 });
    for await (const { content } of prediction) {
      process.stdout.write(content);
    }
    const result = await prediction;
    console.info(result);
  } catch (err) {
    console.error("Error in LMStudio test:", err);
  } finally {
    process.exit(0);
  }
}
