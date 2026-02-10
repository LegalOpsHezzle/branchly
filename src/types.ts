export type NodeType = 'decision' | 'information';

export interface Position {
  x: number;
  y: number;
}

export interface Option {
  id: string;
  label: string;
  targetNodeId: string | null;
  isExternalLink: boolean;
  externalUrl?: string;
}

export interface NodeContent {
  title: string;
  bodyText: string;
  imageUrl?: string;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  position: Position;
  content: NodeContent;
  options: Option[];
}

export interface Flow {
  id: string;
  title: string;
  description: string;
  startNodeId: string;
  nodes: FlowNode[];
}

export type ViewMode = 'editor' | 'player';
export type UIMode = 'user' | 'lawyer';
