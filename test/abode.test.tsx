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
  getGlobalProps,
} from '../src/abode';
// @ts-ignore
import TestComponent from './TestComponent';
import TestComponentProps, { util } from './TestComponentProps';
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
    abodeElement.setAttribute('data-prop-number-prop', '12345');
    abodeElement.setAttribute('data-prop-null-prop', 'null');
    abodeElement.setAttribute('data-prop-true-prop', 'true');
    abodeElement.setAttribute('data-prop-leading-zeros', '0012');
    abodeElement.setAttribute('data-prop-leading-zero', '012');
    abodeElement.setAttribute('data-prop-sku-one', 'B123456');
    abodeElement.setAttribute('data-prop-sku-two', 'AW-ARZA18-C0LM-78');
    abodeElement.setAttribute('data-prop-sku-three', 'TO-8370-228-770-6.0');
    abodeElement.setAttribute('data-prop-float', '10.46');
    abodeElement.setAttribute('data-prop-empty-prop', '');
    abodeElement.setAttribute(
      'data-prop-json-prop',
      '{"id": 12345, "product": "keyboard", "variant": {"color": "blue"}}'
    );

    const props = getElementProps(abodeElement);

    expect(props).toEqual({
      testProp: 'testPropValue',
      numberProp: 12345,
      nullProp: null,
      trueProp: true,
      leadingZeros: '0012',
      leadingZero: '012',
      skuOne: 'B123456',
      skuTwo: 'AW-ARZA18-C0LM-78',
      skuThree: 'TO-8370-228-770-6.0',
      float: 10.46,
      emptyProp: '',
      jsonProp: { id: 12345, product: 'keyboard', variant: { color: 'blue' } },
    });
  });
  it('getElementProps parses JSON', () => {
    fc.assert(
      fc.property(fc.jsonObject({ maxDepth: 10 }), data => {
        const abodeElement = document.createElement('div');
        abodeElement.setAttribute('data-prop-test-prop', JSON.stringify(data));
        const props = getElementProps(abodeElement);
        expect(props.testProp).toEqual(data);
      })
    );
  });

  it('getElementProps does not parse strings with leading zeros followed by other digits', () => {
    const strWithLeadingZeros = fc
      .tuple(fc.integer(1, 10), fc.integer())
      .map(t => {
        const [numberOfZeros, integer] = t;
        return '0'.repeat(numberOfZeros) + integer.toString();
      });
    fc.assert(
      fc.property(strWithLeadingZeros, data => {
        const abodeElement = document.createElement('div');
        abodeElement.setAttribute('data-prop-test-prop', data);
        const props = getElementProps(abodeElement);
        expect(props.testProp).toEqual(data);
      })
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
    let promise = Object.values(components)[0].module;
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
    promise = Object.values(components)[1].module;
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

  it('uses custom prop parsers', async () => {
    const spy = jest.spyOn(util, 'getProps');
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', 'TestComponentProps');
    abodeElement.setAttribute('data-prop-number', '1');
    abodeElement.setAttribute('data-prop-boolean', 'true');
    abodeElement.setAttribute('data-prop-number-as-string', '123');
    abodeElement.setAttribute('data-prop-float', '1.01');
    document.body.appendChild(abodeElement);

    register('TestComponentProps', () => TestComponentProps, {
      propParsers: {
        number: (prop: string) => Number(prop),
        boolean: (prop: string) => Boolean(prop),
        numberAsString: (prop: string) => prop,
        float: (prop: string) => parseFloat(prop),
      },
    });
    await populate();
    await delay(20);

    expect(document.body.innerHTML).toEqual(
      `<div data-component="TestComponentProps" data-prop-number="1" data-prop-boolean="true" data-prop-number-as-string="123" data-prop-float="1.01" react-abode-populated="true"><div>1 2 3</div></div>`
    );
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({
      number: 1,
      boolean: true,
      numberAsString: '123',
      float: 1.01,
    });
  });
  it('uses JSON.parse as a custom prop parser', async () => {
    const spy = jest.spyOn(util, 'getProps');
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('data-component', 'TestComponentProps');
    document.body.appendChild(abodeElement);
    fc.assert(
      fc.property(fc.anything(), data => {
        abodeElement.setAttribute('data-prop-anything', JSON.stringify(data));
        register('TestComponentProps', () => TestComponentProps, {
          propParsers: {
            anything: (prop: string) => JSON.parse(prop),
          },
        });
        populate()
          .then(() => delay(20))
          .then(() => {
            expect(spy).toHaveBeenCalledWith({ anything: data });
          });
      })
    );
  });

  it('getGlobalProps', () => {
    const abodeElement = document.createElement('div');
    abodeElement.setAttribute('id', 'globalProps');
    abodeElement.setAttribute('data-prop-global-str', 'test');
    abodeElement.setAttribute('data-prop-global-bool', 'true');
    document.body.appendChild(abodeElement);

    const globalProps = getGlobalProps('globalProps', {
      propParsers: { globalBool: (prop: string) => String(prop) },
    });

    expect(globalProps).toStrictEqual({
      globalStr: 'test',
      globalBool: 'true',
    });
  });
  it.skip('getActiveComponents', () => {});
  it.skip('setComponentSelector', () => {});
  it.skip('register', () => {});
});
