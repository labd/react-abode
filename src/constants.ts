import type { RegisteredComponents } from 'types';

export let componentSelector = 'data-component';
export let components: RegisteredComponents = new Map();
export let unpopulatedElements: Element[] = [];

export const setComponentSelector = (selector: string) => {
  componentSelector = selector;
};

export const setUnpopulatedElements = (value: Element[]) => {
  unpopulatedElements = value;
};
