import { render } from 'react-dom';
import { createElement } from 'react';

interface RegisteredComponent {
  name: string;
  fn: () => Promise<any>;
}
interface Props {
  [key: string]: string;
}

let componentSelector = 'data-component';
let components: RegisteredComponent[] = [];
let scriptProps: Props = {};

export const register = (name: string, fn: () => Promise<any>) => {
  components = [...components, { name, fn }];
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

export const update = async () => {
  components.forEach(async component => {
    const refs = Array.from(
      document.querySelectorAll(`[${componentSelector}=${component.name}]`)
    ).filter(el => !el.getAttribute('react-abode-populated'));

    // tag first, since adding components is a slow process and will cause components to get iterated multiple times
    refs.forEach(el => el.setAttribute('react-abode-populated', 'true'));

    if (refs.length) {
      const module = await component.fn();
      refs.forEach(el => {
        const props = getProps(el);
        render(createElement(module.default, props), el);
      });
    }
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
