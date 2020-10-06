import {
  getCleanPropName,
  getAbodeElements,
  unPopulatedElements,
  setUnpopulatedElements,
  getElementProps,
  setAttributes,
  renderAbode,
  register,
  unRegisterAllComponents,
  components,
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

  it('renderAbode without component name set', async () => {
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', '');

    let err;
    try {
      await renderAbode(abodeElement);
    } catch (error) {
      err = error;
    }

    expect(err.message).toEqual(
      'not all react-abode elements have a value for  data-component'
    );
  });

  it('renderAbode without component registered', async () => {
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', 'TestComponent');

    let err;
    try {
      await renderAbode(abodeElement);
    } catch (error) {
      err = error;
    }

    expect(err.message).toEqual('no component registered for TestComponent');
  });
});

describe('exported functions', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
    unRegisterAllComponents();
  });

  it('register', async () => {
    await register('TestComponent', () => import('./TestComponent'));
    expect(Object.keys(components)).toEqual(['TestComponent']);
    expect(Object.values(components).length).toEqual(1);
    expect(Object.keys(Object.values(components)[0])).toEqual(['default']);
  });

  it.skip('getActiveComponents', () => {});
  it.skip('setComponentSelector', () => {});
  it.skip('register', () => {});
  it.skip('populate', () => {});
  it.skip('getSriptProps', () => {});
});
