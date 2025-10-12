![image](src/resources/public/templates/Hybrid/Charactor_Creater_Template3.png)

[日本語](README.md) | [English](README.en.md) | [简体中文](README.zh-CN.md)

**Last Updated:** 2025-10-11

## Kavukiai

Kavukiai (working title) is a desktop tool with a node-based UI that lets you connect local AI services and experiment with them.

You can link nodes together to build AI workflows.

## Features

- Kavukiai is a node editor with nodes that can call LM Studio and ComfyUI, allowing you to compose workflows by combining nodes.
- Possible workflow patterns are summarized in [Workflow.md](doc/workflow.md).
- Each node has a run button so you can trigger or branch the processing flow.
- This is an experimental alpha version covering only the basics (a minimal LLM invocation and displaying generated images).
- Workflows can be saved as JSON or PNG, and each format can be loaded by drag and drop.
- Only the Windows build is available at the moment.

> ⚠️  Kavukiai is less capable than solutions such as ComfyUI with its plugins, Dify, n8n, or even Vibe Coding (ChatGPT and similar tools). Please try those first to see whether they meet your needs, and use Kavukiai when you have an idea you specifically want to prototype with it.

## Release History
2025-10-11 v5.0.1 released

## Installation

### 1. Prerequisites

Install [LM Studio](https://lmstudio.ai/) and [Comfy UI Desktop](https://www.comfy.org/), then download suitable models.

Example models:
- qwen/qwen3-30b-a3b-2507
- WAI-NSFW-illustrious-SDXL v15.0

### 2. Download, extract, launch

From the [Releases page](https://github.com/ahehead/Kavukiai/releases/), open the latest release page, download the `.exe`, and run it.  
(A warning will appear because the executable is currently unsigned.)

Note: Builds for multiple platforms exist, but only the Windows build has been checked.

### Verified environments
- Windows 11
- GPU NVIDIA GeForce RTX 3060 Ti (VRAM 8 GB)
- Verified with LM Studio 0.3.30 / ComfyUI Desktop v0.3.63

## Basic Operations
- Drag nodes with the mouse to move them.
- There are orange connections for the execution flow (push) and blue connections for the data flow (pull); connect matching types.
- Create nodes from the context menu (right click).
- Pan the canvas with the middle mouse button.
- Copy and paste nodes with `Ctrl + C` / `Ctrl + V`.

## Known Issues (planned for fixes)
- ComfyUI error messages are hard to understand.
- No loading animation yet.
- `JsonSchemaNode` cannot define nested structures; only simple key-value shapes are available.
- Detaching a connection only shows a menu.
- Only the Windows build has been validated.
- Looping is technically possible, but the blue (data) connections are mostly unavailable, so it is effectively impractical.
- The save behavior feels awkward and the UX needs work.

## Roadmap
- Variable node
- Use an image as input for LLMs and similar components.

## Adding Nodes
Fork the repository, clone it locally, have an AI help you implement the node, push, and open a pull request…

## Feedback
Please use GitHub Issues.

## License
MIT  
[LICENSE.md](LICENSE.md)

## Prompts Used in the App
You can load prompts from the in-app templates.  
A handful of prompts found online and believed to be under CC BY-equivalent licenses are bundled.  
Credits and sources are listed below.

[カガミカミ水鏡](https://potofu.me/kagamikami): [小説企画＋執筆用ゴールシークプロンプト](https://github.com/kgmkm/goalseek_ad)

[robo-robo](https://note.com/robo_robo_9): [イメージチャットシステムプロンプト](https://note.com/robo_robo_9/n/nef5345f312d7)

[ぬるぽらぼ](https://x.com/NullpoLab): [インタラクティブテキストアドベンチャーゲームプロンプト](https://note.com/nullpolab/n/n738c84e2110e)
