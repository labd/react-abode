import type { Options, PopulateOptions, RegisterFN } from 'types';
import { components } from './constants';
import { checkForAndHandleNewComponents, retry } from './helpers';

export const populate = async (options?: PopulateOptions) => {
  await checkForAndHandleNewComponents(options);

  document.body.addEventListener('DOMNodeInserted', () =>
    checkForAndHandleNewComponents(options)
  );
};

/**
 * Register adds a component to the list of available components
 *
 * The registered components will be used to populate a given DOM.
 * @param name Name of the component
 * @param fn The React component function
 * @param options Options object
 */
export const register = (name: string, fn: RegisterFN, options?: Options) => {
  components.set(name, { module: retry(fn, 10, 20), options });
};
