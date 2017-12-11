const EnzymeAdapater = require('enzyme/src/adapters/EnzymeAdapter')

class PreactEnzymeAdapater extends EnzymeAdapater {
  // @TODO implement a mount renderer
  createMountRenderer(options) {
    throwUnimplementedError('createMountRenderer')
    return {
      render(element) {
        // @TODO render the element
      },
      unmount() {
        // @TODO unmount the component tree
      },
      getNode() {
        // @TODO return the node for the instance
      },
      simulateEvent(node, event, mock) {
        // @TODO simulate an event
      },
      batchedUpdates(fn) {
        // @TODO figure out if we even need this?
      },
    }
  }
  // @TODO implement a shallow renderer
  createShallowRenderer(options) {
    throwUnimplementedError('createShallowRenderer')
    return {
      render(element) {
        // @TODO render the element
      },
      unmount() {
        // @TODO unmount the component tree
      },
      getNode() {
        // @TODO return the node for the instance
      },
      simulateEvent(node, event, mock) {
        // @TODO simulate an event
      },
      batchedUpdates(fn) {
        // @TODO figure out if we even need this?
      },
    }
  }

  // @TODO implement a string renderer
  createStringRenderer(options) {
    throwUnimplementedError('createStringRenderer')
    return {
      render(element) {
        // @TODO render the element to a string
      },
    }
  }

  // @TODO return the correct renderer
  createRenderer(options) {
    throwUnimplementedError('createRenderer')
  }

  // @TODO implement nodeToElement
  nodeToElement(node) {
    throwUnimplementedError('nodeToElement')
  }

  // @TODO implement elementToNode
  elementToNode(element) {
    throwUnimplementedError('elementToNode')
  }

  // @TODO implement nodeToHostNode
  nodeToHostNode(node) {
    throwUnimplementedError('nodeToHostNode')
  }
}

function throwUnimplementedError(name) {
  throw new Error(`Error: PreactEnzymeAdapater.${name} is not yet implemented`)
}

module.exports = PreactEnzymeAdapater
