# enzyme-adapter-preact

Enzyme adapter for Preact

## Installation and usage

Install adapter with `npm install enzyme-adapter-preact --save-dev` or `yarn add enzyme-adapter-preact --dev`. Use it like this in ES6 projects:

```javascript
import Enzyme from 'enzyme';
import { Adapter } from 'enzyme-adapter-preact';

Enzyme.configure({ adapter: new Adapter() });
```

or like this in CommonJS projects:

```javascript
const Enzyme = require('enzyme');
const { Adapter } = require('enzyme-adapter-preact');

Enzyme.configure({ adapter: new Adapter() });
```
