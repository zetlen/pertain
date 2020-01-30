import path from 'path';
import PackageJson from '../PackageJson';

test('handles missing deps and devdeps', () => {
  const missingDeps = new PackageJson(
    path.resolve(__dirname, './__fixtures__/missing-deps')
  );
  expect(missingDeps.dependencies).toBeTruthy();
  expect(missingDeps.devDependencies).toBeTruthy();
});
