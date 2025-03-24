
import { useEffect } from 'react';
import { useKeyPress } from '@xyflow/react';

export function useKeyboardShortcuts(
  readOnly: boolean,
  selectedNode: any | null,
  deleteSelectedNode: () => void,
  handleSave: () => void,
  undoAction: () => void,
  redoAction: () => void
) {
  const deleteKeyPressed = useKeyPress('Delete');
  const ctrlSPressed = useKeyPress(['Control', 's']);
  const ctrlZPressed = useKeyPress(['Control', 'z']);
  const ctrlYPressed = useKeyPress(['Control', 'y']);

  // Effect hooks for keyboard shortcuts
  useEffect(() => {
    if (deleteKeyPressed && selectedNode && !readOnly) {
      deleteSelectedNode();
    }
  }, [deleteKeyPressed, selectedNode, readOnly, deleteSelectedNode]);

  useEffect(() => {
    if (ctrlSPressed && !readOnly) {
      handleSave();
    }
  }, [ctrlSPressed, readOnly, handleSave]);

  useEffect(() => {
    if (ctrlZPressed && !readOnly) {
      undoAction();
    }
  }, [ctrlZPressed, readOnly, undoAction]);

  useEffect(() => {
    if (ctrlYPressed && !readOnly) {
      redoAction();
    }
  }, [ctrlYPressed, readOnly, redoAction]);
}
