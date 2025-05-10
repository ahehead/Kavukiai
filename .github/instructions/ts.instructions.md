---
applyTo: '**/*.{ts,tsx,js,jsx,css}'
---

## Tech stack
- **Electron** 
- **React 19**   
- **TypeScript 5**   
- **Tailwind CSS 4**   
- **Rete 2.0.5**   
- **shadcn/ui & lucide-react & Class Variance Authority**
- **Zustand**   

## **生成時の指針**  
- コメントはなるべく残す。
- ノードエディタ関連コードは Rete v2 API に準拠。  
- 状態管理は `zustand` を前提に設計。  
- Class Variance Authority を使用してマークアップ（レイアウト部分）だけを presentational componentに切り出し、ロジックコンポーネントと分ける。
- なるべく`#fetch`を使用してから答える。

## tools
Use the `#githubRepo` tool with `retejs/retejs.org` to find relevant documentation for Rete.js. 
Use the `#githubRepo` tool with `retejs/rete` to answer questions about how Rete.js core is implemented.
Use the `#githubRepo` tool with `retejs/react-plugin` to answer questions about the Rete.js React plugin implementation.
