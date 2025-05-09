import { memo } from 'react';
import type { File } from 'shared/AppType';
import { useIsFileDirty } from '../dirty-check/useIsFileDirty';
import { CloseFileButton, PlusButton } from '../../components/atom/UIButton';



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
    <div className="flex border-b bg-sidebar">
      <div className="flex flex-nowrap overflow-hidden">
        {files.map(file => (
          <TabItem
            key={file.id}
            file={file}
            active={file.id === activeFileId}
            onSelect={onSelect}
            onClose={onClose}
          />
        ))}
      </div>
      <div className="flex flex-1 items-center pl-2 flex-shrink-0 focus:outline-0">
        <PlusButton onClick={onNewFile} />
      </div>
    </div>
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
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      onClick={() => onSelect(file.id)}
      className={`
        flex min-w-0 items-center pl-3 pr-2 py-2 cursor-pointer
        border-t-0 border-b-0 border-x-2 rounded-t-md
        ${active
          ? 'bg-background '
          : 'bg-sidebar'}
      `}
    >
      <span className="flex-shrink min-w-0 truncate whitespace-nowrap mr-1">
        {file.title}
      </span>
      <CloseFileButton isDirty={isDirty} onClick={e => onClose(file.id, e)} />
    </div>
  );
});
