import { memo } from 'react';
import { X, Plus, Circle } from 'lucide-react';
import type { File } from 'shared/AppType';
import { useIsFileDirty } from '../dirty-check/useIsFileDirty';
import { UIButton } from '../../components/atom/IconButton';


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
    <div className="flex border-b bg-gray-100">
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
        <UIButton
          onClick={onNewFile}
        >
          <Plus className="icon-base-size" />
        </UIButton>
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
        border-t-2 border-b-0 border-x-2 rounded-t-md
        ${active
          ? 'bg-background '
          : 'bg-gray-100 '}
      `}
    >
      <span className="flex-shrink min-w-0 truncate whitespace-nowrap mr-1">
        {file.title}
      </span>
      <UIButton
        onClick={e => onClose(file.id, e)}
      >
        {isDirty ? (
          <Circle className="close-icon-maru" />
        ) : (
          <X className="icon-base-size" />
        )}
      </UIButton>
    </div>
  );
});
