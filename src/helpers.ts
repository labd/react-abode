import { createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { getCurrentScript } from 'tiny-current-script';
import {
  components,
  componentSelector,
  setUnpopulatedElements,
  unpopulatedElements,
} from './constants';
import {
  HTMLElementAttributes,
  Options,
  PopulateOptions,
  Props,
} from './types';

export const unRegisterAllComponents = () => {
  components.clear();
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const retry = async (
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
      throw new Error(err as string);
    }
  }
};

export const getRegisteredComponents = () => {
  return components;
};

export const getActiveComponents = () => {
  return Array.from(
    new Set(getAbodeElements().map((el) => el.getAttribute(componentSelector)))
  );
};

// start prop logic
export const getCleanPropName = (raw: string): string => {
  return raw
    .replace('data-prop-', '')
    .replace(/-./g, (x) => x.toUpperCase()[1]);
};

export const getElementProps = (
  el: Element | HTMLScriptElement,
  options?: Options
): Props => {
  const props: { [key: string]: string } = {};

  if (el?.attributes) {
    const rawProps = Array.from(el.attributes).filter((attribute) =>
      attribute.name.startsWith('data-prop-')
    );
    rawProps.forEach((prop) => {
      const componentName = getComponentName(el) ?? '';
      const propName = getCleanPropName(prop.name);
      const propParser =
        options?.propParsers?.[propName] ??
        components.get(componentName)?.options?.propParsers?.[propName];
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
    (el) => {
      const component = el.getAttribute(componentSelector);

      // It should exist in registered components
      return component && components.get(component);
    }
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
  return Array.from(el.attributes).find((at) => at.name === componentSelector)
    ?.value;
}

export const renderAbode = async (el: Element, root: Root) => {
  const props = getElementProps(el);

  const componentName = getComponentName(el);

  if (!componentName || componentName === '') {
    throw new Error(
      `not all react-abode elements have a value for  ${componentSelector}`
    );
  }

  const module = await components.get(componentName)?.module;
  if (!module) {
    throw new Error(`no component registered for ${componentName}`);
  }

  const element = module.default || module;

  root.render(createElement(element, props));
};

export const trackPropChanges = (el: Element, root: Root) => {
  if (MutationObserver) {
    const observer = new MutationObserver(() => {
      renderAbode(el, root);
    });
    observer.observe(el, { attributes: true });
  }
};

function unmountOnNodeRemoval(element: any, root: Root) {
  const observer = new MutationObserver(function () {
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
      root.unmount();
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
  elements.forEach((el) => el.setAttribute('react-abode-populated', 'true'));
  elements.forEach((el) => {
    const root = createRoot(el);
    if (options?.attributes) setAttributes(el, options.attributes);
    renderAbode(el, root);
    trackPropChanges(el, root);
    unmountOnNodeRemoval(el, root);
  });
};

export const checkForAndHandleNewComponents = async (
  options?: PopulateOptions
) => {
  setUnpopulatedElements(
    getAbodeElements().filter((el) => !el.getAttribute('react-abode-populated'))
  );

  if (unpopulatedElements.length) {
    await update(unpopulatedElements, options);
    setUnpopulatedElements([]);
    if (options?.callback) options.callback();
  }
};
