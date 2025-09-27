# Clipboard Shortcut Integration

Purpose: Enable node editor users to trigger copy/paste via `Ctrl+C` / `Ctrl+V` using existing context menu logic without breaking Monaco text editing.

Steps:
1. Track the active editor focus state (`rete` canvas vs text inputs such as Monaco).
2. Register `Ctrl+C` / `Ctrl+V` keyboard handlers on the editor container that delegate to copy/paste routines when the canvas is active.
3. Provide hooks for Monaco-based nodes to flip the focus state if shortcut interference appears during testing.
