import ExplicitDependency from './ExplicitDependency';
import { Resolver } from './resolverFactory';
import TopologicalSorter from './TopologicalSorter';

/**
 * A set of modules that can be queried for pertaining to a given subject.
 */
export default class ExplicitDependencySet {
  private resolve: Resolver;
  private dependencies: ExplicitDependency[];

  /**
   * Cache storage to prevent unnecessary recalculation of the same list.
   * The same subject should result in the same list while this object exists.
   */
  private sortedBySubject: Map<string, ExplicitDependency[]>;

  constructor(resolve: Resolver, names: string[]) {
    this.resolve = resolve;
    this.dependencies = [];
    this.sortedBySubject = new Map();
    names.forEach((name) => this.add(name));
  }

  /**
   * Gets a list of ExplicitDependencies in this set which pertain to the
   * subject (that is, their `package.json` has a valid key for the subject
   * that indicates a requireable file). Detects dependencies between the
   * packages that pertain and sorts the list in dependency order.
   */
  public pertaining(subject: string) {
    let sorted = this.sortedBySubject.get(subject);
    if (!sorted) {
      const pertaining: ExplicitDependency[] = this.dependencies.filter(
        (dependency) => dependency.pertains(subject)
      );
      // Returns a list of dependents (not dependencies) of the supplied
      // dependency. This is the data structure needed for an efficient
      // topological sort.
      const getOutgoingEdges = (dependency: ExplicitDependency) =>
        pertaining.filter(
          (dependent) =>
            dependent !== dependency && dependent.dependsOn(dependency.name)
        );
      const sorter = new TopologicalSorter<ExplicitDependency>(
        getOutgoingEdges
      );
      sorted = sorter.sort(pertaining);
      this.sortedBySubject.set(subject, sorted);
    }
    return sorted;
  }

  /**
   * Only add dependencies which can be resolved in the first place. If there
   * is a problem finding them, just skip them; they don't pertain!
   */
  private add(name: string) {
    const modulePath = this.resolve(name);
    if (modulePath) {
      const dependency = new ExplicitDependency(modulePath);
      this.dependencies.push(dependency);
    }
  }
}
