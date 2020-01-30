import path from 'path';
import pertain from '../';
import TopologicalSort from '../TopologicalSort';

const projectPath = path.join(__dirname, '__fixtures__/cool-cactus');

test('pertains to "germane.identify" in dep order to list ingredients in a cool cactus', () => {
  const identifiers = pertain(projectPath, 'germane.identify');
  const ingredients = identifiers
    .map(i => `- ${i.name} adds ${require(i.path)()}`)
    .join('\n');
  expect(ingredients).toMatchSnapshot();
});

test('runs the same sequence without invoking sort twice', () => {
  pertain.clearCache();
  const sort = jest.spyOn(TopologicalSort.prototype, 'sort');
  pertain(projectPath, 'germane.identify');
  pertain(projectPath, 'germane.identify');
  expect(sort).toHaveBeenCalledTimes(1);
  sort.mockRestore();
});

test('pertains to "germane.draw" in dep order to draw the cool cactus', () => {
  const picture = pertain(projectPath, 'germane.draw').reduce(
    (drawing, artist) => require(artist.path)(drawing),
    ''
  );
  expect(picture).toMatchSnapshot();
});

test('throws informative error if a dep declares an invalid pertainer', () => {
  expect(() => pertain(projectPath, 'lies')).toThrow('could not find');
});

test('throws informative error if circular deps are detected', () => {
  expect(() => pertain(projectPath, 'humpty')).toThrow('Cyclic');
});