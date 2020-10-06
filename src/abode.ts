import { render } from 'react-dom';
import { createElement } from 'react';

interface RegisteredComponents {
  [key: string]: Promise<any>;
}

interface Props {
  [key: string]: string;
}

interface HTMLElementAttributes {
  [key: string]: string;
}

interface PopulateOptions {
  attributes?: HTMLElementAttributes;
  callback?: Function;
}

export let componentSelector = 'data-component';
export let components: RegisteredComponents = {};
export let unPopulatedElements: Element[] = [];

export const register = async (name: string, fn: () => Promise<any>) => {
  components[name] = await retry(fn, 10, 20);
};

export const unRegisterAllComponents = () => {
  components = {};
};

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const retry = async (
  fn: () => any,
  times: number,
  delayTime: number
): Promise<any> => {
  try {
    return await fn();
  } catch (err) {
    if (times > 1) {
      await delay(delayTime);
      return retry(fn, times - 1, delayTime * 2);
    } else {
      throw new Error(err);
    }
  }
};

export const setComponentSelector = (selector: string) => {
  componentSelector = selector;
};

export const getActiveComponents = () => {
  return Array.from(
    new Set(getAbodeElements().map(el => el.getAttribute(componentSelector)))
  );
};

// start prop logic
export const getCleanPropName = (raw: string): string => {
  return raw.replace('data-prop-', '').replace(/-./g, x => x.toUpperCase()[1]);
};

export const getElementProps = (el: Element | HTMLScriptElement): Props => {
  const props: { [key: string]: string } = {};

  if (el?.attributes) {
    const rawProps = Array.from(el.attributes).filter(attribute =>
      attribute.name.startsWith('data-prop-')
    );
    rawProps.forEach(prop => (props[getCleanPropName(prop.name)] = prop.value));
  }

  return props;
};

export const getScriptProps = () => {
  const element = document.currentScript as HTMLScriptElement;
  return getElementProps(element);
};
// end prop logic

// start element logic
export const getAbodeElements = (): Element[] => {
  return Array.from(document.querySelectorAll(`[${componentSelector}]`));
};

export const setUnpopulatedElements = () => {
  unPopulatedElements = getAbodeElements().filter(
    el => !el.getAttribute('react-abode-populated')
  );
};

export const setAttributes = (
  el: Element,
  attributes: HTMLElementAttributes
) => {
  Object.entries(attributes).forEach(([k, v]) => el.setAttribute(k, v));
};
// end element logic

export const renderAbode = async (el: Element) => {
  const props = getElementProps(el);

  const componentName = Array.from(el.attributes).find(
    at => at.name === componentSelector
  )?.value;

  if (!componentName || componentName === '') {
    throw new Error(
      `not all react-abode elements have a value for  ${componentSelector}`
    );
  }

  const module = await components[componentName];
  if (!module) {
    throw new Error(`no component registered for ${componentName}`);
  }

  // @ts-ignore
  render(createElement(module.default, props), el);
};

export const trackPropChanges = (el: Element) => {
  const observer = new MutationObserver(() => {
    renderAbode(el);
  });
  observer.observe(el, { attributes: true });
};

export const update = async (
  elements: Element[],
  options?: PopulateOptions
) => {
  // tag first, since adding components is a slow process and will cause components to get iterated multiple times
  elements.forEach(el => el.setAttribute('react-abode-populated', 'true'));
  elements.forEach(el => {
    if (options?.attributes) setAttributes(el, options.attributes);
    renderAbode(el);
    trackPropChanges(el);
  });
};

const checkForAndHandleNewComponents = async (options?: PopulateOptions) => {
  setUnpopulatedElements();

  if (unPopulatedElements.length) {
    await update(unPopulatedElements, options);
    unPopulatedElements = [];
    if (options?.callback) options.callback();
  }
};

export const populate = async (options?: PopulateOptions) => {
  checkForAndHandleNewComponents(options);
  document.body.addEventListener('DOMNodeInserted', () =>
    checkForAndHandleNewComponents(options)
  );
};
