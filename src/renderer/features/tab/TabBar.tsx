import { memo } from 'react'
import {
  TabAddButtonSpace,
  TabBarComponent,
  TabItemComponent,
  TabItems,
  TabTitle,
} from 'renderer/features/tab/TabComponent'
import type { File } from 'shared/AppType'
import { CloseFileButton, PlusButton } from '../../components/UIButton'
import { useIsFileDirty } from '../dirty-check/useIsFileDirty'

export default function TabBar({
  files,
  activeFileId,
  onSelect,
  onClose,
  onNewFile,
}: {
  files: File[]
  activeFileId: string | null
  onSelect: (id: string) => void
  onClose: (id: string, e: React.MouseEvent) => void
  onNewFile: () => void
}) {
  return (
    <TabBarComponent>
      <TabItems>
        {files.map(file => (
          <TabItem
            key={file.id}
            file={file}
            active={file.id === activeFileId}
            onSelect={onSelect}
            onClose={onClose}
          />
        ))}
      </TabItems>
      <TabAddButtonSpace>
        <PlusButton onClick={onNewFile} />
      </TabAddButtonSpace>
    </TabBarComponent>
  )
}

const TabItem = memo(
  ({
    file,
    active,
    onSelect,
    onClose,
  }: {
    file: { id: string; title: string }
    active: boolean
    onSelect: (id: string) => void
    onClose: (id: string, e: React.MouseEvent) => void
  }) => {
    const isDirty = useIsFileDirty(file.id)

    return (
      <TabItemComponent active={active} onClick={() => onSelect(file.id)}>
        <TabTitle>{file.title}</TabTitle>
        <CloseFileButton isDirty={isDirty} onClick={e => onClose(file.id, e)} />
      </TabItemComponent>
    )
  }
)
