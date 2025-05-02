import { memo } from 'react';
import { X, Plus, Circle } from 'lucide-react';
import type { File } from 'shared/AppType';
import { useIsFileDirty } from 'renderer/hooks/useIsFileDirty';

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
      className={`flex min-w-0 items-center pl-3 pr-2 py-2 cursor-pointer ${active ? 'bg-white rounded-t-lg' : 'bg-gray-200'
        }`}
    >
      <span className="flex-shrink min-w-0 truncate whitespace-nowrap mr-1">
        {file.title}
      </span>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <span
        onClick={e => onClose(file.id, e)}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-300 rounded-md"
      >
        {isDirty ? (
          <Circle className="w-3 h-3" fill="#4a5565" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </span>
    </div>
  );
});

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
    <div className="flex border-b bg-gray-200">
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
        <button
          onClick={onNewFile}
          className="w-5 h-5 flex items-center justify-center focus:outline-0 hover:bg-gray-300 rounded-md"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
