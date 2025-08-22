import React from 'react'
import ReactDom from 'react-dom/client'

import { AppRoutes } from './routes'

import './globals.css'


///// Monaco Editor
import { loader } from '@monaco-editor/react'

import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

loader.config({ monaco })
const mona = await loader.init();

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
