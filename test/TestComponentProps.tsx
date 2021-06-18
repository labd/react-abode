import React from 'react';

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
  return <div>1 2 3</div>;
};

export default TestComponentProps;
