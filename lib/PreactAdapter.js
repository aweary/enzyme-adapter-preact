Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preact = require('preact');

var _preact2 = _interopRequireDefault(_preact);

var _preactRenderToString = require('preact-render-to-string');

var _preactRenderToString2 = _interopRequireDefault(_preactRenderToString);

var _shallow = require('react-test-renderer/shallow');

var _shallow2 = _interopRequireDefault(_shallow);

var _object = require('object.values');

var _object2 = _interopRequireDefault(_object);

var _enzyme = require('enzyme');

var _enzymeAdapterUtils = require('enzyme-adapter-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VNode = _preact2['default'].h('a', null).constructor;
var EmptyComponent = function EmptyComponent() {
  return null;
};
var KEY = '__k';
var REF = '__r';
var TEXT_NODE = 3;

function instanceToTree(node) {
  if (!node) {
    return null;
  }
  var instance = node._component;
  var hostNodeProps = node.__preactattr_;
  var children = [].slice.call(node.childNodes);
  // If _component exists this node is the root of a composite
  if (instance) {
    var props = instance.props;
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
    };
  }

  if (node.nodeType === TEXT_NODE) {
    return node.nodeValue;
  }

  return {
    nodeType: 'host',
    type: node.nodeName.toLowerCase(),
    props: hostNodeProps,
    instance: node,
    rendered: children.map(instanceToTree)
  };
}

var PreactAdapter = function (_EnzymeAdapter) {
  _inherits(PreactAdapter, _EnzymeAdapter);

  function PreactAdapter() {
    _classCallCheck(this, PreactAdapter);

    var _this = _possibleConstructorReturn(this, (PreactAdapter.__proto__ || Object.getPrototypeOf(PreactAdapter)).call(this));

    _this.options = Object.assign({}, _this.options, {
      supportPrevContextArgumentOfComponentDidUpdate: true
    });
    return _this;
  }

  _createClass(PreactAdapter, [{
    key: 'createMountRenderer',
    value: function () {
      function createMountRenderer(options) {
        (0, _enzymeAdapterUtils.assertDomAvailable)('mount');
        var domNode = options.attachTo || global.document.createElement('div');
        var instance = null;
        return {
          render: function () {
            function render(el, context, callback) {
              if (instance === null) {
                var PreactWrapperComponent = (0, _enzymeAdapterUtils.createMountWrapper)(el, options);
                var wrappedEl = _preact2['default'].h(PreactWrapperComponent, {
                  Component: el.type,
                  props: el.props,
                  context: context
                });
                instance = _preact2['default'].render(wrappedEl, domNode);
                if (typeof callback === 'function') {
                  callback();
                }
              } else {
                instance.setChildProps(el.props, context, callback);
              }
            }

            return render;
          }(),
          unmount: function () {
            function unmount() {
              _preact2['default'].render(_preact2['default'].h(EmptyComponent), domNode, instance);
              instance = null;
            }

            return unmount;
          }(),
          getNode: function () {
            function getNode() {
              var tree = instanceToTree(instance);
              return instance ? tree.rendered : null;
            }

            return getNode;
          }(),
          simulateEvent: function () {
            function simulateEvent(node, event, mock) {
              var mappedEvent = (0, _enzymeAdapterUtils.mapNativeEventNames)(event);
              var eventFn = TestUtils.Simulate[mappedEvent];
              if (!eventFn) {
                throw new TypeError('ReactWrapper::simulate() event \'' + String(event) + '\' does not exist');
              }
              eventFn(node.instance && node.instance.base || node.instance, mock);
            }

            return simulateEvent;
          }(),
          batchedUpdates: function () {
            function batchedUpdates(fn) {
              return fn;
            }

            return batchedUpdates;
          }()
        };
      }

      return createMountRenderer;
    }()
  }, {
    key: 'createShallowRenderer',
    value: function () {
      function createShallowRenderer() /* options */{
        var renderer = new _shallow2['default']();
        var isDOM = false;
        var cachedNode = null;
        return {
          render: function () {
            function render(el, context) {
              cachedNode = el;
              if (typeof el.nodeName === 'string') {
                isDOM = true;
              } else {
                isDOM = false;
                return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                  return renderer.render(el, context);
                });
              }
            }

            return render;
          }(),
          unmount: function () {
            function unmount() {
              renderer.unmount();
            }

            return unmount;
          }(),
          getNode: function () {
            function getNode() {
              if (isDOM) {
                return (0, _enzymeAdapterUtils.elementToTree)(cachedNode);
              }
              var output = renderer.getRenderOutput();
              return {
                nodeType: renderer._instance ? 'class' : 'function',
                type: cachedNode.nodeName,
                props: cachedNode.attributes,
                key: cachedNode[KEY] || undefined,
                ref: cachedNode[REF],
                instance: renderer._instance,
                rendered: (0, _enzymeAdapterUtils.elementToTree)(output)
              };
            }

            return getNode;
          }(),
          simulateEvent: function () {
            function simulateEvent(node, event) {
              for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                args[_key - 2] = arguments[_key];
              }

              var handler = node.props[(0, _enzymeAdapterUtils.propFromEvent)(event)];
              if (handler) {
                (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                  return handler.apply(undefined, _toConsumableArray(args));
                });
              }
            }

            return simulateEvent;
          }(),
          batchedUpdates: function () {
            function batchedUpdates(fn) {
              return (0, _enzymeAdapterUtils.withSetStateAllowed)(fn);
            }

            return batchedUpdates;
          }()
        };
      }

      return createShallowRenderer;
    }()
  }, {
    key: 'createStringRenderer',
    value: function () {
      function createStringRenderer(options) {
        return {
          render: function () {
            function render(el, context) {
              if (options.context && (el.nodeName.contextTypes || options.childContextTypes)) {
                var childContextTypes = Object.assign({}, el.nodeName.contextTypes || {}, options.childContextTypes);
                var ContextWrapper = (0, _enzymeAdapterUtils.createRenderWrapper)(el, context, childContextTypes);
                return (0, _preactRenderToString2['default'])(_preact2['default'].h(ContextWrapper));
              }
              return (0, _preactRenderToString2['default'])(el);
            }

            return render;
          }()
        };
      }

      return createStringRenderer;
    }()

    // Provided a bag of options, return an `EnzymeRenderer`. Some options can be implementation
    // specific, like `attach` etc. for React, but not part of this interface explicitly.
    // eslint-disable-next-line class-methods-use-this, no-unused-vars

  }, {
    key: 'createRenderer',
    value: function () {
      function createRenderer(options) {
        switch (options.mode) {
          case _enzyme.EnzymeAdapter.MODES.MOUNT:
            return this.createMountRenderer(options);
          case _enzyme.EnzymeAdapter.MODES.SHALLOW:
            return this.createShallowRenderer(options);
          case _enzyme.EnzymeAdapter.MODES.STRING:
            return this.createStringRenderer(options);
          default:
            throw new Error('Enzyme Internal Error: Unrecognized mode: ' + String(options.mode));
        }
      }

      return createRenderer;
    }()

    // converts an RSTNode to the corresponding JSX Pragma Element. This will be needed
    // in order to implement the `Wrapper.mount()` and `Wrapper.shallow()` methods, but should
    // be pretty straightforward for people to implement.

  }, {
    key: 'nodeToElement',
    value: function () {
      function nodeToElement(node) {
        if (!node || (typeof node === 'undefined' ? 'undefined' : _typeof(node)) !== 'object') return null;
        return _preact2['default'].h(node.type, (0, _enzymeAdapterUtils.propsWithKeysAndRef)(node));
      }

      return nodeToElement;
    }()
  }, {
    key: 'elementToNode',
    value: function () {
      function elementToNode(element) {
        return (0, _enzymeAdapterUtils.elementToTree)(element);
      }

      return elementToNode;
    }()
  }, {
    key: 'nodeToHostNode',
    value: function () {
      function nodeToHostNode(node) {
        return node.instance && node.instance.base || node.instance;
      }

      return nodeToHostNode;
    }()
  }, {
    key: 'isValidElement',
    value: function () {
      function isValidElement(element) {
        return element && element instanceof VNode;
      }

      return isValidElement;
    }()
  }, {
    key: 'createElement',
    value: function () {
      function createElement() {
        return _preact2['default'].h.apply(_preact2['default'], arguments);
      }

      return createElement;
    }()
  }]);

  return PreactAdapter;
}(_enzyme.EnzymeAdapter);

exports['default'] = PreactAdapter;