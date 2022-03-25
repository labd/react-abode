import { getCurrentScript } from 'tiny-current-script';
import { render, unmountComponentAtNode } from 'react-dom';
import { createElement, FC } from 'react';

interface RegisteredComponents {
  [key: string]: {
    module: Promise<any>;
    options?: { propParsers?: PropParsers };
  };
}

interface Props {
  [key: string]: string;
}

interface Options {
  propParsers?: PropParsers;
}
interface PropParsers {
  [key: string]: ParseFN;
}

interface HTMLElementAttributes {
  [key: string]: string;
}

interface PopulateOptions {
  attributes?: HTMLElementAttributes;
  callback?: Function;
}

export type RegisterPromise = () => Promise<any>;
export type RegisterComponent = () => FC<any>;
export type RegisterFN = RegisterPromise | RegisterComponent;
export type ParseFN = (rawProp: string) => any;

export let componentSelector = 'data-component';
export let components: RegisteredComponents = {};
export let unPopulatedElements: Element[] = [];

export const register = (name: string, fn: RegisterFN, options?: Options) => {
  components[name] = { module: retry(fn, 10, 20), options };
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

export const getRegisteredComponents = () => {
  return components;
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

export const getElementProps = (
  el: Element | HTMLScriptElement,
  options?: Options
): Props => {
  const props: { [key: string]: string } = {};

  if (el?.attributes) {
    const rawProps = Array.from(el.attributes).filter(attribute =>
      attribute.name.startsWith('data-prop-')
    );
    rawProps.forEach(prop => {
      const componentName = getComponentName(el) ?? '';
      const propName = getCleanPropName(prop.name);
      const propParser =
        options?.propParsers?.[propName] ??
        components[componentName]?.options?.propParsers?.[propName];
      if (propParser) {
        // custom parse function for prop
        props[propName] = propParser(prop.value);
      } else {
        // default json parsing
        if (/^0+\d+$/.test(prop.value)) {
          /*
          ie11 bug fix;
          in ie11 JSON.parse will parse a string with leading zeros followed
          by digits, e.g. '00012' will become 12, whereas in other browsers
          an exception will be thrown by JSON.parse
          */
          props[propName] = prop.value;
        } else {
          try {
            props[propName] = JSON.parse(prop.value);
          } catch (e) {
            props[propName] = prop.value;
          }
        }
      }
    });
  }

  return props;
};

export const getScriptProps = (options?: Options) => {
  const element = getCurrentScript();
  if (element === null) {
    throw new Error('Failed to get current script');
  }
  return getElementProps(element, options);
};
// end prop logic

// start element logic
export const getAbodeElements = (): Element[] => {
  return Array.from(document.querySelectorAll(`[${componentSelector}]`)).filter(
    el => {
      const component = el.getAttribute(componentSelector);

      // It should exist in registered components
      return component && components[component];
    }
  );
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

function getComponentName(el: Element) {
  return Array.from(el.attributes).find(at => at.name === componentSelector)
    ?.value;
}

export const renderAbode = async (el: Element) => {
  const props = getElementProps(el);

  const componentName = getComponentName(el);

  if (!componentName || componentName === '') {
    throw new Error(
      `not all react-abode elements have a value for  ${componentSelector}`
    );
  }

  const module = await components[componentName]?.module;
  if (!module) {
    throw new Error(`no component registered for ${componentName}`);
  }

  const element = module.default || module;

  render(createElement(element, props), el);
};

export const trackPropChanges = (el: Element) => {
  if (MutationObserver) {
    const observer = new MutationObserver(() => {
      renderAbode(el);
    });
    observer.observe(el, { attributes: true });
  }
};

function unmountOnNodeRemoval(element: any) {
  const observer = new MutationObserver(function() {
    function isDetached(el: any): any {
      if (el.parentNode === document) {
        return false;
      } else if (el.parentNode === null) {
        return true;
      } else {
        return isDetached(el.parentNode);
      }
    }

    if (isDetached(element)) {
      observer.disconnect();
      unmountComponentAtNode(element);
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
}

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
    unmountOnNodeRemoval(el);
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
  await checkForAndHandleNewComponents(options);

  document.body.addEventListener('DOMNodeInserted', () =>
    checkForAndHandleNewComponents(options)
  );
};
