import { memo } from 'react';
import type { File } from 'shared/AppType';
import { useIsFileDirty } from '../dirty-check/useIsFileDirty';
import { CloseFileButton, PlusButton } from '../../components/UIButton';
import { TabAddButtonSpace, TabBarComponent, TabItems, TabItemComponent, TabTitle } from 'renderer/components/TabComponent';



export default function TabBar({
  files,
  activeFileId,
  onSelect,
  onClose,
  onNewFile
}: {
  files: File[];
  activeFileId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string, e: React.MouseEvent) => void;
  onNewFile: () => void;
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
  );
}


const TabItem = memo(({
  file,
  active,
  onSelect,
  onClose
}: {
  file: { id: string; title: string };
  active: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string, e: React.MouseEvent) => void;
}) => {
  const isDirty = useIsFileDirty(file.id);

  return (
    <TabItemComponent
      active={active}
      onClick={() => onSelect(file.id)}
    >
      <TabTitle>{file.title}</TabTitle>
      <CloseFileButton isDirty={isDirty} onClick={e => onClose(file.id, e)} />
    </TabItemComponent>
  )
}
)
