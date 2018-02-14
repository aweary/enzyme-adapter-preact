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

const VNode = Preact.h('a', null).constructor;
const EmptyComponent = () => null;
const KEY = '__k'
const REF = '__r'
const TEXT_NODE = 3

function instanceToTree(node) {
  if (!node) {
    return null
  }
  const instance = node._component;
  const hostNodeProps = node.__preactattr_;
  const children = [].slice.call(node.childNodes);
  // If _component exists this node is the root of a composite
  if (instance) {
    const props = instance.props;
    return {
      nodeType: 'class',
      type: instance.constructor,
      props: props,
      key: instance[KEY],
      ref: instance[REF],
      instance: instance,
      rendered: {
        nodeType: 'host',
        type: node.nodeName.toLowerCase(),
        props: hostNodeProps,
        instance: node,
        children: children.map(instanceToTree)
      }
    }
  }

  if (node.nodeType === TEXT_NODE) {
    return node.nodeValue
  }

  return {
    nodeType: 'host',
    type: node.nodeName.toLowerCase(),
    props: hostNodeProps,
    instance: node,
    rendered: children.map(instanceToTree),
  }
}

class PreactAdapter extends EnzymeAdapter {
  constructor() {
    super();
    this.options = {
      ...this.options,
      supportPrevContextArgumentOfComponentDidUpdate: true,
    };
  }
  createMountRenderer(options) {
    assertDomAvailable('mount');
    const domNode = options.attachTo || global.document.createElement('div');
    let instance = null;
    return {
      render(el, context, callback) {
        if (instance === null) {
          const PreactWrapperComponent = createMountWrapper(el, options);
          const wrappedEl = Preact.h(PreactWrapperComponent, {
            Component: el.type,
            props: el.props,
            context,
          });
          instance = Preact.render(wrappedEl, domNode);
          if (typeof callback === 'function') {
            callback();
          }
        } else {
          instance.setChildProps(el.props, context, callback);
        }
      },
      unmount() {
        Preact.render(Preact.h(EmptyComponent), domNode, instance);
        instance = null;
      },
      getNode() {
        const tree = instanceToTree(instance);
        return instance ? tree.rendered : null;
      },
      simulateEvent(node, event, mock) {
        const mappedEvent = mapNativeEventNames(event);
        const eventFn = TestUtils.Simulate[mappedEvent];
        if (!eventFn) {
          throw new TypeError(`ReactWrapper::simulate() event '${event}' does not exist`);
        }
        eventFn(node.instance && node.instance.base || node.instance, mock);
      },
      batchedUpdates(fn) {
        return fn;
      }
    };
  }

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
          key: cachedNode[KEY] || undefined,
          ref: cachedNode[REF],
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
    return element && (element instanceof VNode);
  }

  createElement(...args) {
    return Preact.h(...args);
  }
}

module.exports = PreactAdapter;
