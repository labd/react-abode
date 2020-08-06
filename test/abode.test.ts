import { getCleanPropName } from './../src/abode';

describe('getCleanPropName', () => {
  it('formats props', () => {
    expect(getCleanPropName('data-prop-some-random-prop')).toEqual(
      'someRandomProp'
    );
  });
});
