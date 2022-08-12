# React Abode

React Abode is a simple React micro-frontend framework allowing you to host multiple react components by defining HTML.

## Features

### Prop passing

React Abode allows you to pass props to your React components by using a `data-prop-prop-name` attribute. All props need to be prefixed by `data-prop-`. Props will automatically be converted from kebab-case to camelCase.

```html
<div data-component="Price" data-prop-sku="123456"></div>
```

### Script props

React Abode allows you to pass `data-prop-` props to the script. These can then be consumed inside your bundle by using `getScriptProps()`. This is useful when you need to have a prop available in every component.

```html
<script
  src="your/bundle/location.js"
  data-prop-global-prop="some prop you want in all your components"
></script>
```

```javascript
const scriptProps = getScriptProps();
console.log(scriptProps.globalProp);
```

### Prop parsing

By default all supplied props will be parsed with `JSON.parse`. In case a prop should be parsed differently, custom parse functions can be provided to `register` or `getScriptProps`.

```js
// <div data-component="Product" data-prop-sku="1234" data-prop-is-available="true" data-prop-price="10.99" >
register('Product', () => import('./modules/Product/Product'), {
  propParsers: {
    sku: prop => String(prop),
    isAvailable: prop => Boolean(prop),
    price: prop => Float(prop),
  },
});
// <script data-prop-global="1234"></script>
getScriptProps({ propParsers: { global: prop => String(prop) } });
```

- default JSON.parse
- custom prop parsing function

### Automatic DOM node detection

When DOM nodes are added, for example when loading more products in a catalog on a SPA, React Abode will automatically detect them and populate them with your React components.
When a DOM node containing a hosted React component is removed, the component is unmounted.

### Update on prop change

When the props for your components change, React Abode will rerender these components. This can be very useful when nesting multiple layers of front-end frameworks.

## How to use

Create a bundle with one or more abode registered components. This takes the place of the `App` component in a create-react-app, which links the top level react component to the html page. When all components are registered, call `populate`. Build and host this bundle on your platform of choice.

```javascript
// src/modules/Cart/Cart.tsx
const Cart = (): JSX.Element => {
  return <h1>a shopping cart</div>;
};

// src/App.tsx
import { populate, register } from 'react-abode';

// Import can be used to register component
register('Cart', () => import('./modules/Cart/Cart'));

// Component can also be used directly
import Cart from './modules/Cart/Cart';

register('Cart', () => React.memo(Cart));

populate({ attributes: { classname: 'some-class-name' } });
```

Include a div with the selector in your HTML. Load the bundle in a script tag **inside the `<body> </body>`**. On loading the page, React Abode will check for components with the matching selector, which is `data-component` by default.

```html
<html>
  <body>
    <div data-component="Cart">
      This text wil be replaced by your react component
    </div>
    <script src="your/bundle/location.js"></script>
  </body>
</html>
```

## Options

### Utility functions

#### setComponentSelector

If you do not want to use `data-component` you can change the component selector by using `setComponentSelector('data-my-component-selector')`.

#### getActiveComponents

You can use `getActiveComponents` to get a list of all Abode elements currently in your DOM.

#### getRegisteredComponents

You can use `getRegisteredComponents` to get all registered components.

### Populate parameters

The `populate` function can be passed an object with options.

| name       | type     | purpose                                                                                     | example                                                 |
| ---------- | -------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| attributes | object   | attributes which will be aplied to every react-abode container                              | `{attributes: { classname: "some-class-name"}}`         |
| callback   | function | function which will be executed every time a new batch of react-abode elements is populated | `() => console.log('new abode elements added to page')` |

## Contributing

After having commited your changes, run `pnpm changeset` and specify an appropriate bump type and a message. If you want to use your commit message(s) as the changeset message, run `pnpm get:changes` which copies all commit message(s) to your clipboard which you can then paste when running `pnpm changeset`.
