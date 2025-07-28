import { Chat } from "@lmstudio/sdk";
import { findLoadedModel, getLMStudioClient } from "./modelClient";

(async () => {
  try {
    // LMStudio クライアントを取得
    const client = await getLMStudioClient();
    const modelKey = "qwen2.5-7b-instruct";

    // モデルが既にロードされているか確認
    let model = await findLoadedModel(modelKey);
    if (!model) {
      console.log(`Model ${modelKey} not loaded. Loading...`);
      model = await client.llm.load(modelKey);
      console.log(`Model loaded: ${model.modelKey}`);
    } else {
      console.log(`Using existing loaded model: ${model.modelKey}`);
    }

    // チャットメッセージを作成
    const chat = Chat.from([
      { role: "system", content: "You are a resident AI philosopher." },
      { role: "user", content: "What is the meaning of life?" },
    ]);

    // レスポンスをストリーミング
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
})();
