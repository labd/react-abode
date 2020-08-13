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

let componentSelector = 'data-component';
let components: RegisteredComponents = {};
let unPopulatedElements: Element[] = [];

export const register = (name: string, fn: () => Promise<any>) => {
  components[name] = fn();
};

export const setComponentSelector = (selector: string) => {
  componentSelector = selector;
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
export const setUnpopulatedElements = () => {
  unPopulatedElements = Array.from(
    document.querySelectorAll(`[${componentSelector}]`)
  ).filter(el => !el.getAttribute('react-abode-populated'));
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
  if (!componentName) {
    new Error(
      `not all react-abode elements have a value for  ${componentSelector}`
    );
    return;
  }
  const module = await components[componentName];
  if (!module) {
    new Error(`no component registered for ${componentName}`);
    return;
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

export const populate = async (options?: PopulateOptions) => {
  const checkForAndHandleNewComponents = async () => {
    setUnpopulatedElements();

    if (unPopulatedElements.length) {
      await update(unPopulatedElements, options);
      unPopulatedElements = [];
      if (options?.callback) options.callback();
    }
  };

  checkForAndHandleNewComponents();
  document.body.addEventListener(
    'DOMNodeInserted',
    checkForAndHandleNewComponents
  );
};
