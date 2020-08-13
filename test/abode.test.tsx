import {
  getCleanPropName,
  getAbodeElements,
  unPopulatedElements,
  setUnpopulatedElements,
  getElementProps,
  setAttributes,
} from '../src/abode';

describe('getCleanPropName', () => {});

describe('helper functions', () => {
  beforeEach(() => (document.getElementsByTagName('html')[0].innerHTML = ''));

  it('getCleanPropName', () => {
    expect(getCleanPropName('data-prop-some-random-prop')).toEqual(
      'someRandomProp'
    );
  });

  it('getAbodeElements', () => {
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', 'TestComponent');
    document.body.appendChild(abodeElement);

    expect(getAbodeElements()).toHaveLength(1);
  });

  it('setUnpopulatedElements', () => {
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', 'TestComponent');
    document.body.appendChild(abodeElement);

    setUnpopulatedElements();

    expect(unPopulatedElements).toHaveLength(1);
  });

  it('getElementProps', () => {
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', 'TestComponent');
    abodeElement.setAttribute('data-prop-test-prop', 'testPropValue');

    const props = getElementProps(abodeElement);

    expect(props).toEqual({ testProp: 'testPropValue' });
  });

  it('setAttributes', () => {
    const abodeElement = document.createElement('div');

    setAttributes(abodeElement, { classname: 'test-class-name' });

    expect(abodeElement.getAttribute('classname')).toBe('test-class-name');
  });

  it.skip('getSriptProps', () => {});
  it.skip('renderAbode', () => {});
});

describe('exported functions', () => {
  it.skip('register', () => {});
  it.skip('getActiveComponents', () => {});
  it.skip('setComponentSelector', () => {});
  it.skip('register', () => {});
  it.skip('populate', () => {});
});
