import React from 'react'
import ReactDom from 'react-dom/client'

import { AppRoutes } from './routes'

import './globals.css'

///// Monaco Editor
import { loader } from '@monaco-editor/react'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import 'monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu'

self.MonacoEnvironment = {
  getWorker(_, _label) {
    return new editorWorker()
  },
}

loader.config({ monaco })
const mona = await loader.init()

mona.editor.defineTheme('logViewerLight', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#f3f4f6',
    'editorGutter.background': '#f3f4f6',
    'editor.selectionBackground': '#2563eb66',
    'editor.inactiveSelectionBackground': '#93c5fd66',
    'editor.selectionHighlightBackground': '#2563eb33',
    'editor.selectionForeground': '#111827',
    // フォーカス時の青い枠線を除去
    focusBorder: '#00000000',
    'editor.focusedBorder': '#00000000',
  },
})

ReactDom.createRoot(document.querySelector('app') as HTMLElement).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
)
