import { Resolver } from './resolver';
import ExplicitDependency from './ExplicitDependency';
import topologicalSort from './topologicalSort';

export default class ExplicitDependencySet {
  private resolve: Resolver;
  private dependencies: ExplicitDependency[];
  private sortedBySubject: Map<string, ExplicitDependency[]>;
  constructor(resolve: Resolver, names: string[]) {
    this.resolve = resolve;
    this.dependencies = [];
    this.sortedBySubject = new Map();
    names.forEach(name => this.add(name));
  }

  private add(name: string) {
    const modulePath = this.resolve(name);
    if (modulePath) {
      const dependency = new ExplicitDependency(modulePath);
      this.dependencies.push(dependency);
    }
  }

  pertaining(subject: string) {
    let sorted = this.sortedBySubject.get(subject);
    if (!sorted) {
      const pertaining: ExplicitDependency[] = this.dependencies.filter(
        dependency => dependency.pertains(subject)
      );
      sorted = topologicalSort(pertaining, dependency =>
        pertaining.filter(
          dependent =>
            dependent !== dependency && dependent.dependsOn(dependency.name)
        )
      );
      this.sortedBySubject.set(subject, sorted);
    }
    return sorted;
  }
}
