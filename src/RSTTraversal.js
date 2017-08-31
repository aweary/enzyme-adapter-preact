const KEY = '__k'
const REF = '__r'
const TEXT_NODE = 3

function toTree(node) {
  if (!node) {
    return null
  }
  const instance = node._component
  const hostNodeProps = node.__preactattr_
  const children = [].slice.call(node.childNodes)
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
        children: children.map(toTree)
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
    rendered: children.map(toTree),
  }
}

module.exports = { toTree }