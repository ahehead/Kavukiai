## ワークフローとその説明

作れるワークフロー例です。ここにあるワークフローはソフト内のmenuのtempletesから読み込むことができます。

### String Template

![string](../src/resources/public/templates/String/String_Template.png)

文字列に値を埋め込む例。

MultiLineNode
- stringを返す。
- {{test}}というプレースホルダを文中で使うと、{test : { type : string}} という感じのJsonSchemaを作り返すことができます。

JsonSchema to Object Node
- JsonSchemaをinputに変えるノード、

Auto Template Replace Node
- {{}}というプレースホルダを使っているstringに、objectを埋め込むノードです。

### String Join

![string join](../src/resources/public/templates/String/string_join.png)

stringをlistにして、joinでくっつける例です。

### LM Studio

![lmstudio](../src/resources/public/templates/LMStudio/LM_Studio_Template.png)

LM Studioを使う例です。

LM Studioを起動、停止、メモリを解放するノード、

UChatノードは、Chat用の履歴を構成するノードです。ここにUChat Messageをリストで保持して、これをLM Studioの引数にしてChatを行います。この部分はループになっています。

### ComfyUI

![comfyui](../src/resources/public/templates/ComfyUI/ComfyUI_Template.png)

ComfyUIを使う例です。

設計としてはComfyUIのワークフローを読み込んで、ワークフローの一部を置き換えて、ComfyUIに投げるようになっています。

