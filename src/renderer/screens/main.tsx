import { Hand } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createNodeEditor } from 'renderer/nodeEditor/createNodeEditor';
import { useRete } from "rete-react-plugin";


// The "App" comes from the context bridge in preload/index.ts
const { App } = window

export function MainScreen() {
  const [ref] = useRete(createNodeEditor);
  const [dataStr, setDataStr] = useState<string>("")

  useEffect(() => {
    const state = App.loadAppState()
    state.then((res) => {
      console.log("state", res)
      setDataStr(JSON.stringify(res))
    }
    )
  }, [])

  return (
    <main className="flex flex-col w-screen h-screen">
      {dataStr} <Hand />
      <div className="App flex-1">
        <div ref={ref} className='w-full h-full' />
      </div>
    </main>
  )
}
