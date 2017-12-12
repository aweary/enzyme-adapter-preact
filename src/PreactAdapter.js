import Preact from 'preact';
import renderToString from 'preact-render-to-string';
import ShallowRenderer from 'react-test-renderer/shallow';
import values from 'object.values';
import { EnzymeAdapter } from 'enzyme';
import {
  elementToTree,
  mapNativeEventNames,
  propFromEvent,
  withSetStateAllowed,
  assertDomAvailable,
  createRenderWrapper,
  createMountWrapper,
  propsWithKeysAndRef,
} from 'enzyme-adapter-utils';

let VNode = Preact.h('a', null).constructor;

function compositeTypeToNodeType(type) {
  switch (type) {
    case 0:
    case 1: return 'class';
    case 2: return 'function';
    default:
      throw new Error(`Enzyme Internal Error: unknown composite type ${type}`);
  }
}
function childrenFromInst(inst, el) {
  if (inst._renderedChildren) {
    return values(inst._renderedChildren);
  } else if (el.props) {
    return values({ '.0': el.props.children });
  }
  return [];
}

function nodeType(inst) {
  if (inst._compositeType != null) {
    return compositeTypeToNodeType(inst._compositeType);
  }
  return 'host';
}

function instanceToTree(inst) {
  if (!inst || typeof inst !== 'object') {
    return inst;
  }
  const el = inst._currentElement;
  if (el == null || el === false) {
    return null;
  } else if (typeof el !== 'object') {
    return el;
  }
  if (inst._renderedChildren) {
    return {
      nodeType: nodeType(inst),
      type: el.nodeName,
      props: el.attributes,
      key: el.key || undefined,
      ref: el.ref,
      instance: inst._instance || inst._hostNode || null,
      rendered: values(inst._renderedChildren).map(instanceToTree),
    };
  }
  if (inst._hostNode) {
    return {
      nodeType: 'host',
      type: el.nodeName,
      props: el.attributes,
      key: el.key || undefined,
      ref: el.ref,
      instance: inst._instance || inst._hostNode || null,
      rendered: childrenFromInst(inst, el).map(instanceToTree),
    };
  }
  if (inst._renderedComponent) {
    return {
      nodeType: nodeType(inst),
      type: el.nodeName,
      props: el.attributes,
      key: el.key || undefined,
      ref: el.ref,
      instance: inst._instance || inst._hostNode || null,
      rendered: instanceToTree(inst._renderedComponent),
    };
  }
  return {
    nodeType: nodeType(inst),
    type: el.nodeName,
    props: el.attributes,
    key: el.key || undefined,
    ref: el.ref,
    instance: inst._instance || null,
    rendered: childrenFromInst(inst, el).map(instanceToTree),
  };
}

class PreactAdapter extends EnzymeAdapter {
  constructor() {
    super();
    this.options = {
      ...this.options,
      supportPrevContextArgumentOfComponentDidUpdate: true,
    };
  }
//   createMountRenderer(options) {
//     assertDomAvailable('mount');
//     const domNode = options.attachTo || global.document.createElement('div');
//     let instance = null;
//     return {
//       render(el, context, callback) {
//         if (instance === null) {
//           const ReactWrapperComponent = createMountWrapper(el, options);
//           const wrappedEl = React.createElement(ReactWrapperComponent, {
//             Component: el.type,
//             props: el.props,
//             context,
//           });
//           instance = ReactDOM.render(wrappedEl, domNode);
//           if (typeof callback === 'function') {
//             callback();
//           }
//         } else {
//           instance.setChildProps(el.props, context, callback);
//         }
//       },
//       unmount() {
//         ReactDOM.unmountComponentAtNode(domNode);
//         instance = null;
//       },
//       getNode() {
//         return instance ? instanceToTree(instance._reactInternalInstance).rendered : null;
//       },
//       simulateEvent(node, event, mock) {
//         const mappedEvent = mapNativeEventNames(event);
//         const eventFn = TestUtils.Simulate[mappedEvent];
//         if (!eventFn) {
//           throw new TypeError(`ReactWrapper::simulate() event '${event}' does not exist`);
//         }
//         // eslint-disable-next-line react/no-find-dom-node
//         eventFn(ReactDOM.findDOMNode(node.instance), mock);
//       },
//       batchedUpdates(fn) {
//         return ReactDOM.unstable_batchedUpdates(fn);
//       },
//     };
//   }

  createShallowRenderer(/* options */) {
    const renderer = new ShallowRenderer();
    let isDOM = false;
    let cachedNode = null;
    return {
      render(el, context) {
        cachedNode = el;
        if (typeof el.nodeName === 'string') {
          isDOM = true;
        } else {
          isDOM = false;
          return withSetStateAllowed(() => renderer.render(el, context));
        }
      },
      unmount() {
        renderer.unmount();
      },
      getNode() {
        if (isDOM) {
          return elementToTree(cachedNode);
        }
        const output = renderer.getRenderOutput();
        return {
          nodeType: renderer._instance ? 'class' : 'function',
          type: cachedNode.nodeName,
          props: cachedNode.attributes,
          key: cachedNode.key || undefined,
          ref: cachedNode.ref,
          instance: renderer._instance,
          rendered: elementToTree(output),
        };
      },
      simulateEvent(node, event, ...args) {
        const handler = node.props[propFromEvent(event)];
        if (handler) {
          withSetStateAllowed(() => handler(...args));
        }
      },
      batchedUpdates(fn) {
        return withSetStateAllowed(fn);
      }
    };
  }

  createStringRenderer(options) {
    return {
      render(el, context) {
        if (options.context && (el.nodeName.contextTypes || options.childContextTypes)) {
          const childContextTypes = {
            ...(el.nodeName.contextTypes || {}),
            ...options.childContextTypes,
          };
          const ContextWrapper = createRenderWrapper(el, context, childContextTypes);
          return renderToString(Preact.h(ContextWrapper));
        }
        return renderToString(el);
      },
    };
  }

  // Provided a bag of options, return an `EnzymeRenderer`. Some options can be implementation
  // specific, like `attach` etc. for React, but not part of this interface explicitly.
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  createRenderer(options) {
    switch (options.mode) {
      case EnzymeAdapter.MODES.MOUNT: return this.createMountRenderer(options);
      case EnzymeAdapter.MODES.SHALLOW: return this.createShallowRenderer(options);
      case EnzymeAdapter.MODES.STRING: return this.createStringRenderer(options);
      default:
        throw new Error(`Enzyme Internal Error: Unrecognized mode: ${options.mode}`);
    }
  }

  // converts an RSTNode to the corresponding JSX Pragma Element. This will be needed
  // in order to implement the `Wrapper.mount()` and `Wrapper.shallow()` methods, but should
  // be pretty straightforward for people to implement.
  nodeToElement(node) {
    if (!node || typeof node !== 'object') return null;
    return Preact.h(node.type, propsWithKeysAndRef(node));
  }

  elementToNode(element) {
    return elementToTree(element);
  }

  nodeToHostNode(node) {
    return node.instance && node.instance.base || node.instance;
  }

  isValidElement(element) {
    // React.isValidElement(element);
    return element && (element instanceof VNode);
  }

  createElement(...args) {
    return Preact.h(...args);
  }
}

module.exports = PreactAdapter;
