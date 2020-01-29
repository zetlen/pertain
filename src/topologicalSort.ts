import PertainError from './PertainError';

export default function topologicalSort<T>(
  nodes: T[],
  outgoingFrom: (node: T) => T[]
): T[] {
  let cursor = nodes.length;
  const sorted: T[] = new Array(cursor);
  const visited: { [key: number]: boolean } = {};
  let i = cursor;
  // Better data structures make algorithm much faster.
  const nodesHash = makeNodesHash(nodes);

  while (i--) {
    if (!visited[i]) visit(nodes[i], i, new Set());
  }

  return sorted;

  function visit(node: T, i: number, predecessors: Set<T>): void {
    if (predecessors.has(node)) {
      throw new PertainError(`Cyclic dependency on ${node}`);
    }

    if (visited[i]) return;
    visited[i] = true;

    const outgoing = outgoingFrom(node);

    if ((i = outgoing.length)) {
      predecessors.add(node);
      do {
        let child = outgoing[--i];
        visit(child, nodesHash.get(child) as number, predecessors);
      } while (i);
      predecessors.delete(node);
    }

    sorted[--cursor] = node;
  }
}

function makeNodesHash<T>(arr: T[]) {
  const res = new Map<T, number>();
  for (let i = 0, len = arr.length; i < len; i++) {
    res.set(arr[i], i);
  }
  return res;
}
