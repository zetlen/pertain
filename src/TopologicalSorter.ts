import PertainError from './PertainError';
/* tslint:disable */

/**
 * Topologically sort a list of items of any type, given a list of items and
 * a map of outward relations between those items. (Could be a function, but
 * it's a class for testability.)
 *
 * Credit to https://github.com/marcelklehr/toposort/ for a great
 * implementation I had to adapt to be faster for our particular use case.
 *
 * That code appears here courtesy of the MIT license.
 */
export default class TopologicalSorter<T> {
  private outgoingFrom: (node: T) => T[];
  constructor(outgoingFrom: (node: T) => T[]) {
    this.outgoingFrom = outgoingFrom;
  }
  public sort(nodes: T[]): T[] {
    let cursor = nodes.length;
    const sorted: T[] = new Array(cursor);
    const visited: { [key: number]: boolean } = {};
    let i = cursor;
    // Better data structures make algorithm much faster.
    const nodesHash = this.makeNodesHash(nodes);

    const { outgoingFrom } = this;

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
  private makeNodesHash(arr: T[]) {
    const res = new Map<T, number>();
    for (let i = 0, len = arr.length; i < len; i++) {
      res.set(arr[i], i);
    }
    return res;
  }
}
