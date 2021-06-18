import React from 'react';
import { getScriptProps } from '../src/abode';

export interface Props {
  number: number;
  boolean: boolean;
  numberAsString: string;
  float: number;
}

export const util = {
  getProps: (props: Props): Props => props,
  getScriptProps: (props: any) => props,
};

const TestComponentProps = (props: Props): JSX.Element => {
  util.getProps(props);
  util.getScriptProps(getScriptProps());
  return <div>1 2 3</div>;
};

export default TestComponentProps;
