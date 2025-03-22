
import FlowNodeComponent from '@/components/FlowNodeComponent';

export const nodeTypes = {
  task: FlowNodeComponent,
  condition: FlowNodeComponent,
  loop: FlowNodeComponent,
  parallel: FlowNodeComponent,
  sequence: FlowNodeComponent,
  event: FlowNodeComponent,
  human_approval: FlowNodeComponent,
  data_operation: FlowNodeComponent,
};
