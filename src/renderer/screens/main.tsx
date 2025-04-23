import { Hand } from 'lucide-react'
import { useEffect, useState } from 'react'


// The "App" comes from the context bridge in preload/index.ts
const { App } = window

export function MainScreen() {

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
    <main className="flex flex-col items-center justify-center h-screen bg-amber-50">
      {dataStr} <Hand />
    </main>
  )
}
