---
mode: 'agent'
tools: ['githubRepo', 'codebase', 'fetch']
description: 'arkTypeのスキーマを作成する。'
---
ノードエディタでopenai response apiを利用するために、responses.tsからarkTypeの型を作ってsrc/renderer/nodeEditor/types/Schemasフォルダに書いてほしい。
・指定した型から初めてほしい。ResponseCreateParamsBaseは(createParams.ts)にできたので、次はOutput系から始めて新しいファイルに書いてほしい。
・ネストは掘っていって小さい単位から作ってほしい。例:const ReasoningEffort = type("low | ...") そして小さい単位を組み合わせてarkTypeを作ってほしい。
・定義されている型は、ショートハンドキーで呼び出せるようにオブジェクトに登録してほしい 例:{Reasoning : type({"effort?": ReasoningEffort.or("null")})}。

参考ファイル1。response.ts
node_modules/.pnpm/openai@5.0.1_zod@3.25.23/node_modules/openai/src/resources/responses/responses.ts
同じファイルのgithubのリンク。
https://github.com/openai/openai-node/blob/eebb832c8433696976375e7f1446070f2dc4d91a/src/resources/responses/responses.ts



参考ファイル2。shared.ts
node_modules/.pnpm/openai@5.0.1_zod@3.25.23/node_modules/openai/src/resources/shared.ts
同じファイルのgithubのリンク。
https://github.com/openai/openai-node/blob/eebb832c8433696976375e7f1446070f2dc4d91a/src/resources/shared.ts

openai公式apiのドキュメント
https://platform.openai.com/docs/api-reference/responses
