
import { ReactFlow, MiniMap, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Flow } from '@/lib/types';
import { useFlowEditorState } from '@/hooks/useFlowEditorState';
import { nodeTypes } from './nodeTypes';
import { FlowEditorTopBar } from './FlowEditorTopBar';
import { FlowEditorToolbar } from './FlowEditorToolbar';
import { NodeToolbar } from './NodeToolbar';
import { NodeAddMenu } from './NodeAddMenu';
import { ApprovalPanel } from './ApprovalPanel';
import { EmptyFlowState } from './EmptyFlowState';
import { FlowEditorLoadingState } from './FlowEditorLoadingState';
import { FlowEditorOverlay } from './FlowEditorOverlay';

interface FlowEditorProps {
  flow: Flow;
  onSave?: (flow: Flow) => void;
  onRun?: (flow: Flow) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  error?: Error | null;
}

export default function FlowEditor({ 
  flow, 
  onSave, 
  onRun,
  readOnly = false,
  isLoading = false,
  error = null
}: FlowEditorProps) {
  // Show loading or error state if needed
  if (isLoading || error) {
    return <FlowEditorLoadingState isLoading={isLoading} error={error} />;
  }

  // Use the custom hook to manage state
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    handleNodeClick,
    isFullscreen,
    searchQuery,
    setSearchQuery,
    historyIndex,
    history,
    isSaving,
    isRunning,
    reactFlowWrapper,
    pendingApprovals,
    handleSave,
    handleRun,
    addNewNode,
    deleteSelectedNode,
    duplicateSelectedNode,
    approveHumanNode,
    toggleFullscreen,
    exportFlow,
    organizeLayout,
    undoAction,
    redoAction,
    flow: currentFlow
  } = useFlowEditorState(flow, onSave, onRun, readOnly);

  // If there are no nodes, show the empty state
  if (nodes.length === 0) {
    return (
      <div className="border rounded-md p-8 h-[500px] flex items-center justify-center" ref={reactFlowWrapper}>
        <EmptyFlowState 
          readOnly={readOnly} 
          setNodes={(newNodes) => onNodesChange([{ type: 'add', item: newNodes[0] }])} 
          saveToHistory={() => {}} 
        />
      </div>
    );
  }

  return (
    <div className={`border rounded-md ${isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-[500px]'} relative`} ref={reactFlowWrapper}>
      <FlowEditorOverlay isSaving={isSaving} isRunning={isRunning} />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-right"
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Controls showInteractive={true} />
        <MiniMap />
        <Background />
        
        {/* Status Bar */}
        <FlowEditorTopBar 
          flowStatus={currentFlow.status} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          readOnly={readOnly}
        />
        
        {!readOnly && (
          <>
            {/* Main Toolbar */}
            <FlowEditorToolbar 
              onSave={handleSave}
              onRun={handleRun}
              onUndo={undoAction}
              onRedo={redoAction}
              onToggleFullscreen={toggleFullscreen}
              onOrganizeLayout={organizeLayout}
              onExportFlow={exportFlow}
              isFullscreen={isFullscreen}
              isRunning={isRunning || currentFlow.status === 'running'}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              isSaving={isSaving}
            />
            
            {/* Selected Node Toolbar */}
            {selectedNode && (
              <NodeToolbar
                selectedNode={selectedNode}
                onDuplicate={duplicateSelectedNode}
                onDelete={deleteSelectedNode}
              />
            )}
            
            {/* Node Add Menu */}
            <NodeAddMenu onAddNode={addNewNode} />
          </>
        )}
        
        {/* Approval Panel */}
        <ApprovalPanel 
          pendingApprovals={pendingApprovals}
          nodes={nodes}
          onApprove={approveHumanNode}
        />
      </ReactFlow>
    </div>
  );
}
