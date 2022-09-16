import { FC } from 'react';

// interface RegisteredComponents {
//   [key: string]: {
//     module: Promise<any>;
//     options?: { propParsers?: PropParsers };
//   };
// }

type RegisteredComponents = Map<
  string,
  { module: Promise<any>; options?: { propParsers?: PropParsers } }
>;

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
  callback?: () => void;
}

export type RegisterPromise = () => Promise<any>;
export type RegisterComponent = () => FC<any>;
export type RegisterFN = RegisterPromise | RegisterComponent;
export type ParseFN = (rawProp: string) => any;
