import { Flow, FlowNode } from '../types';

export const calculateHierarchicalLayout = (flow: Flow): FlowNode[] => {
  const { nodes, startNodeId } = flow;
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const levels: Map<string, number> = new Map();
  const levelMembers: Map<number, string[]> = new Map();

  // BFS to determine levels
  const queue: { id: string; level: number }[] = [{ id: startNodeId, level: 0 }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    if (!levels.has(id)) {
      levels.set(id, level);
      if (!levelMembers.has(level)) levelMembers.set(level, []);
      levelMembers.get(level)!.push(id);
    }

    const node = nodeMap.get(id);
    if (node) {
      node.options.forEach(opt => {
        if (opt.targetNodeId && !visited.has(opt.targetNodeId)) {
          queue.push({ id: opt.targetNodeId, level: level + 1 });
        }
      });
    }
  }

  // Handle orphans (nodes not reachable from start)
  nodes.forEach(node => {
    if (!levels.has(node.id)) {
      const orphanLevel = 99; // Put them far down or in a group
      levels.set(node.id, orphanLevel);
      if (!levelMembers.has(orphanLevel)) levelMembers.set(orphanLevel, []);
      levelMembers.get(orphanLevel)!.push(node.id);
    }
  });

  const VERTICAL_SPACING = 250;
  const HORIZONTAL_SPACING = 300;
  const CANVAS_CENTER = 600;

  return nodes.map(node => {
    const level = levels.get(node.id) || 0;
    const members = levelMembers.get(level) || [];
    const index = members.indexOf(node.id);
    
    // Center the level horizontally
    const totalWidth = (members.length - 1) * HORIZONTAL_SPACING;
    const startX = CANVAS_CENTER - (totalWidth / 2);
    
    return {
      ...node,
      position: {
        x: startX + (index * HORIZONTAL_SPACING),
        y: 100 + (level * VERTICAL_SPACING)
      }
    };
  });
};
