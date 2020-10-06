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
  populate,
  delay,
} from '../src/abode';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

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
    register('TestComponent', () => import('./TestComponent'));
    expect(Object.keys(components)).toEqual(['TestComponent']);
    expect(Object.values(components).length).toEqual(1);
    const promise = Object.values(components)[0];
    expect(typeof promise.then).toEqual('function');
    const module = await promise;
    expect(Object.keys(module)).toEqual(['default']);
  });

  it('populate', async () => {
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', 'TestComponent');
    document.body.appendChild(abodeElement);
    expect(document.body.innerHTML).toEqual(
      `<div data-component="TestComponent"></div>`
    );

    register('TestComponent', () => import('./TestComponent'));
    populate();

    await delay(20);

    expect(document.body.innerHTML).toEqual(
      `<div data-component="TestComponent" react-abode-populated="true"><div>testing 1 2 3 </div></div>`
    );
  });

  it.skip('getActiveComponents', () => {});
  it.skip('setComponentSelector', () => {});
  it.skip('register', () => {});
  it.skip('getSriptProps', () => {});
});
