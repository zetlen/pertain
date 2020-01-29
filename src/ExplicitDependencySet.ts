import Resolver from './Resolver';
import ExplicitDependency from './ExplicitDependency';
import topologicalSort from './topologicalSort';

export default class ExplicitDependencySet {
  private resolver: Resolver;
  private dependencies: ExplicitDependency[];
  private sortedBySubject: Map<string, ExplicitDependency[]>;
  constructor(resolver: Resolver, names: string[]) {
    this.resolver = resolver;
    this.dependencies = [];
    this.sortedBySubject = new Map();
    names.forEach(name => this.add(name));
  }
  private add(name: string) {
    const dependency = new ExplicitDependency({
      name,
      modulePath: this.resolver.rootDir(name)
    });
    this.dependencies.push(dependency);
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
