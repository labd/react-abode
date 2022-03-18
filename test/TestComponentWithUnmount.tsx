import React, { useEffect } from 'react';

const TestComponentWithUnmount = (): JSX.Element => {
  useEffect(() => {
    return () => {
      const unmountElement = document.createElement('unmounted');
      document.body.appendChild(unmountElement);
    };
  }, []);

  return <h1>test component</h1>;
};

export default TestComponentWithUnmount;
