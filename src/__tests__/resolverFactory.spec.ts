import path from 'path';
import { resolver as resolverFactory } from '../';

describe('locally', () => {
  const base = path.resolve(__dirname, '../../');
  const resolve = resolverFactory(base);

  test('resolves node_modules', () => {
    const typescriptPath = resolve('typescript') as string;
    expect(typescriptPath).toBeTruthy();
    expect(
      require.resolve('typescript').startsWith(typescriptPath)
    ).toBeTruthy();
  });

  test('resolves relative with an entry point', () => {
    expect(resolve('./')).toBe(base);
  });
});

describe('from another root directory', () => {
  const coolCactus = path.resolve(__dirname, './__fixtures__/cool-cactus');
  const resolve = resolverFactory(coolCactus);

  test('resolves node_modules with an entry point', () => {
    expect(resolve('treachery')).toBe(
      path.resolve(coolCactus, './node_modules/treachery')
    );
  });

  test('resolves node_modules with no entry point', () => {
    expect(resolve('@garden/cactus')).toBe(
      path.resolve(coolCactus, './node_modules/@garden/cactus')
    );
  });

  test('resolves node_modules recursively', () => {
    const typescriptPath = resolve('typescript') as string;
    expect(typescriptPath).toBeTruthy();
    expect(
      require.resolve('typescript').startsWith(typescriptPath)
    ).toBeTruthy();
  });

  test('resolves relative with no entry point', () => {
    expect(resolve('./')).toBe(coolCactus);
  });
});
