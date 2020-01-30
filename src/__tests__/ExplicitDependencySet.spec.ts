import ExplicitDependency from '../ExplicitDependency';
import ExplicitDependencySet from '../ExplicitDependencySet';

jest.mock('../ExplicitDependency');

test('does not add unresolvable dependencies', () => {
  const fakeResolve = jest
    .fn()
    .mockImplementation(name => (name === 'unresolvable' ? undefined : name));
  expect(
    () =>
      new ExplicitDependencySet(fakeResolve, [
        'resolvable',
        'unresolvable',
        'anotherone'
      ])
  ).not.toThrow();
  expect(ExplicitDependency).toHaveBeenCalledTimes(2);
});
