import { Link } from 'react-router-dom'
import { MenuButton } from 'renderer/components/UIButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'renderer/components/ui/dropdown-menu'

export interface TitleBarProps {
  onSave: () => Promise<void>
  onSaveAs: () => Promise<void>
  onOpen: () => Promise<void>
  onExportPng: () => Promise<void>
}

export function TitleBar({ onSave, onSaveAs, onOpen, onExportPng }: TitleBarProps) {
  return (
    <div className="flex titlebar bg-titlebar">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MenuButton>File</MenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onSave}>Save</DropdownMenuItem>
            <DropdownMenuItem onClick={onSaveAs}>Save As</DropdownMenuItem>
            <DropdownMenuItem onClick={onOpen}>Open</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <MenuButton>
        <Link to="/settings">Settings</Link>
      </MenuButton>
      <MenuButton onClick={onExportPng}>Export as PNG</MenuButton>
      <MenuButton>
        <Link to="/?templates=open">Templates</Link>
      </MenuButton>
    </div>
  )
}

export default TitleBar
