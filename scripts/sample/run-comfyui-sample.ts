/**
 * Ad-hoc runner for ComfyUI sample that waits until finished,
 * with rich console diagnostics and progress reporting.
 *
 * 追加機能:
 * - API 接続に失敗した場合、ComfyUI デスクトップ版（Electron）を自動起動
 * - サーバが立ち上がるまで待機してから再試行
 */

import {
  CallWrapper,
  ComfyApi,
  PromptBuilder,
  type TSamplerName,
  type TSchedulerName,
} from "@saintno/comfyui-sdk";
import Workflow_2 from "../../src/resources/build/sample/workflow_2.json";
import { launchComfyDesktop } from "./comfyDesktop";

const COMFYUI_URL = "http://localhost:8000";
export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
const seed = () => randomInt(10000000000, 999999999999);

async function main() {
  const api = new ComfyApi(COMFYUI_URL);

  // ワークフロー構築（api.osType を利用）
  const workflow = new PromptBuilder(
    Workflow_2,
    [
      "positive",
      "negative",
      "checkpoint",
      "seed",
      "batch",
      "step",
      "cfg",
      "sampler",
      "sheduler",
      "width",
      "height",
    ],
    ["images"]
  )
    .setInputNode("checkpoint", "4.inputs.ckpt_name")
    .setInputNode("seed", "3.inputs.seed")
    .setInputNode("batch", "5.inputs.batch_size")
    .setInputNode("negative", "7.inputs.text")
    .setInputNode("positive", "6.inputs.text")
    .setInputNode("cfg", "3.inputs.cfg")
    .setInputNode("sampler", "3.inputs.sampler_name")
    .setInputNode("sheduler", "3.inputs.scheduler")
    .setInputNode("step", "3.inputs.steps")
    .setInputNode("width", "5.inputs.width")
    .setInputNode("height", "5.inputs.height")
    .setOutputNode("images", "9")
    .input(
      "checkpoint",
      "hassakuXLHentai_v13BetterEyesVersion.safetensors",
      api.osType
    )
    .input("seed", seed())
    .input("step", 6)
    .input("cfg", 1)
    .input<TSamplerName>("sampler", "dpmpp_2m_sde_gpu")
    .input<TSchedulerName>("sheduler", "sgm_uniform")
    .input("width", 1024)
    .input("height", 1024)
    .input("batch", 1)
    .input("positive", "A picture of cute dog on the street");

  const getNodeName = (nodeId: string) => {
    const node = workflow[nodeId];
    return node?._meta?.title ?? node?.class_type ?? nodeId;
  };

  try {
    await api.pollStatus();
  } catch (_error) {
    await launchComfyDesktop();
  }

  try {
    api.init();

    const runner = await new CallWrapper(api, workflow)
      .onPending((promptId?: string) => {
        console.info(`⏳ Pending`, { promptId });
      })
      .onStart((promptId?: string) => {
        console.info(`🟢 Started`, { promptId });
      })
      .onPreview((blob) => {
        console.info(`🖼️ Preview`, {
          type: typeof blob,
        });
      })
      .onOutput((key: any, data: any, promptId?: string) => {
        console.info(`📤 Output`, {
          promptId,
          key,
          data,
        });
      })
      .onProgress((info, promptId) =>
        console.log(
          "Processing node",
          info.node,
          `${info.value}/${info.max} promptId: ${promptId}`
        )
      )
      .onFinished((data: any, promptId?: string) => {
        const images = data?.images?.images ?? [];
        const paths = images.map((img: any) => api.getPathImage(img));
        console.info(`✅ Finished`, {
          promptId,
          paths,
        });
      })
      .onFailed((err) => {
        console.log(err);
        const { node_id, node_type, exception_message } = (err as any).data;
        console.error(
          `❌ Node ${getNodeName(
            node_id
          )} (${node_type}) \n failed: ${exception_message}`
        );
      });

    const result = await runner.run();
    console.log(`result=${result}`);
  } catch (error) {
    console.error(`❌ Error occurred: ${error}`);
  } finally {
    await api.freeMemory(true, true);
    api.destroy();
  }
}

main();
