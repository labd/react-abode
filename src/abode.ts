import { render } from 'react-dom';
import { createElement } from 'react';

interface RegisteredComponents {
  [key: string]: () => Promise<any>;
}
interface Props {
  [key: string]: string;
}

interface Modules {
  [key: string]: NodeModule;
}

let componentSelector = 'data-component';
let components: RegisteredComponents = {};
let scriptProps: Props = {};
let modules: Modules = {};

export const register = (name: string, fn: () => Promise<any>) => {
  components[name] = fn;
};

export const getCleanPropName = (raw: string): string => {
  return raw.replace('data-prop-', '').replace(/-./g, x => x.toUpperCase()[1]);
};

export const getProps = (el: Element | HTMLScriptElement): Props => {
  const props: { [key: string]: string } = {};

  if (el?.attributes) {
    const rawProps = Array.from(el.attributes).filter(attribute =>
      attribute.name.startsWith('data-prop-')
    );
    rawProps.forEach(prop => (props[getCleanPropName(prop.name)] = prop.value));
  }

  return props;
};

export const setScriptProps = () => {
  const element = document.currentScript as HTMLScriptElement;
  scriptProps = getProps(element);
};

export const getScriptProps = () => {
  return { ...scriptProps };
};

export const getModule = async (name: string): Promise<NodeModule> => {
  if (modules[name]) {
    return modules[name];
  }

  if (!components[name]) new Error(`${name} not registered `);
  const module = await components[name]();
  if (!module.default) new Error(`${name} does not have default export `);
  modules[name] = module;
  return module;
};

export const renderAbode = async (el: Element) => {
  const props = getProps(el);

  const componentName = Array.from(el.attributes).find(
    at => at.name === componentSelector
  )?.value;
  if (!componentName) {
    new Error(`value not set for ${componentName}`);
    return;
  }
  const module = await getModule(componentName);

  // @ts-ignore
  render(createElement(module.default, props), el);
};

export const trackPropChanges = (el: Element) => {
  const observer = new MutationObserver(() => {
    renderAbode(el);
  });
  observer.observe(el, { attributes: true });
};

export const update = async () => {
  const refs = Array.from(
    document.querySelectorAll(`[${componentSelector}]`)
  ).filter(el => !el.getAttribute('react-abode-populated'));
  // tag first, since adding components is a slow process and will cause components to get iterated multiple times
  refs.forEach(el => el.setAttribute('react-abode-populated', 'true'));
  refs.forEach(el => {
    renderAbode(el);
    trackPropChanges(el);
  });
};

export const populate = async () => {
  await update();
  document.body.addEventListener('DOMNodeInserted', update);
};

export const setComponentSelector = (selector: string) => {
  componentSelector = selector;
};

setScriptProps();
