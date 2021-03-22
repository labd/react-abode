import * as fc from 'fast-check';
import {
  getCleanPropName,
  getAbodeElements,
  getRegisteredComponents,
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
// @ts-ignore
import TestComponent from './TestComponent';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

describe('helper functions', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
    unRegisterAllComponents();
  });

  it('getCleanPropName', () => {
    expect(getCleanPropName('data-prop-some-random-prop')).toEqual(
      'someRandomProp'
    );
  });

  it('getAbodeElements', () => {
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', 'TestComponent');
    document.body.appendChild(abodeElement);

    expect(getAbodeElements()).toHaveLength(0);

    register('TestComponent', () => TestComponent);

    expect(getAbodeElements()).toHaveLength(1);
  });

  it('setUnpopulatedElements', () => {
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', 'TestComponent');
    document.body.appendChild(abodeElement);

    setUnpopulatedElements();

    expect(unPopulatedElements).toHaveLength(0);

    register('TestComponent', () => TestComponent);
    setUnpopulatedElements();

    expect(unPopulatedElements).toHaveLength(1);
  });

  it('getElementProps', () => {
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', 'TestComponent');
    abodeElement.setAttribute('data-prop-test-prop', 'testPropValue');
    abodeElement.setAttribute('data-prop-empty-prop', '');
    abodeElement.setAttribute('data-prop-array-prop', '[null]');
    abodeElement.setAttribute('data-prop-path-prop', '/index.html');
    abodeElement.setAttribute('data-prop-opening-brackets-prop', '{...[[');
    abodeElement.setAttribute('data-prop-closing-brackets-prop', '}}}]]');
    abodeElement.setAttribute(
      'data-prop-json-prop',
      '{"id": 12345, "product": "keyboard", "variant": {"color": "blue"}}'
    );

    const props = getElementProps(abodeElement);

    expect(props).toEqual({
      testProp: 'testPropValue',
      emptyProp: '',
      arrayProp: [null],
      pathProp: '/index.html',
      openingBracketsProp: '{...[[',
      closingBracketsProp: '}}}]]',
      jsonProp: { id: 12345, product: 'keyboard', variant: { color: 'blue' } },
    });
  });
  it('getElementProps does not parse attributes as JSON if they are not an object or an array', () => {
    const isArrayOrObj = (t: string) => {
      return !/^[.*]$|^{.*}$/.test(t);
    };
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 25 }).filter(isArrayOrObj),
        fc.webUrl(),
        fc.emailAddress(),
        (str, url, email) => {
          const abodeElement = document.createElement('div');
          abodeElement.setAttribute('data-prop-str-prop', str);
          abodeElement.setAttribute('data-prop-url-prop', url);
          abodeElement.setAttribute('data-prop-email-prop', email);
          const props = getElementProps(abodeElement);
          expect(props).toEqual({
            strProp: str,
            urlProp: url,
            emailProp: email,
          });
        }
      )
    );
  });
  it('getElementProps parses JSON if attribute is object or array', () => {
    const isArrayOrObj = (t: unknown) =>
      Array.isArray(t) || (typeof t === 'object' && t !== null);
    fc.assert(
      fc.property(
        fc.jsonObject({ maxDepth: 10 }).filter(isArrayOrObj),
        data => {
          const abodeElement = document.createElement('div');
          abodeElement.setAttribute(
            'data-prop-test-prop',
            JSON.stringify(data)
          );
          const props = getElementProps(abodeElement);
          expect(props.testProp).toEqual(data);
        }
      )
    );
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
    let promise = Object.values(components)[0];
    expect(typeof promise.then).toEqual('function');
    let module = await promise;
    expect(typeof module).toEqual('object');
    expect(Object.keys(module)).toEqual(['default']);

    register('TestComponent2', () => TestComponent);
    expect(Object.keys(components)).toEqual([
      'TestComponent',
      'TestComponent2',
    ]);
    expect(Object.values(components).length).toEqual(2);
    promise = Object.values(components)[1];
    expect(typeof promise.then).toEqual('function');
    module = await promise;
    expect(typeof module).toEqual('function');
  });

  it('populate', async () => {
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', 'TestComponent');
    const abodeSecondElement = document.createElement('div');
    abodeSecondElement.setAttribute('data-component', 'TestComponent2');
    document.body.appendChild(abodeElement);
    document.body.appendChild(abodeSecondElement);
    expect(document.body.innerHTML).toEqual(
      `<div data-component="TestComponent"></div><div data-component="TestComponent2"></div>`
    );

    register('TestComponent', () => import('./TestComponent'));
    register('TestComponent2', () => TestComponent);
    await populate();

    await delay(20);

    expect(document.body.innerHTML).toEqual(
      `<div data-component="TestComponent" react-abode-populated="true"><div>testing 1 2 3 </div></div>` +
        `<div data-component="TestComponent2" react-abode-populated="true"><div>testing 1 2 3 </div></div>`
    );
  });

  it('getRegisteredComponents', () => {
    register('TestComponent', () => import('./TestComponent'));
    register('TestComponent2', () => TestComponent);

    const registeredComponents = getRegisteredComponents();

    expect(Object.keys(registeredComponents).length).toEqual(2);
  });

  it.skip('getActiveComponents', () => {});
  it.skip('setComponentSelector', () => {});
  it.skip('register', () => {});
  it.skip('getSriptProps', () => {});
});
