/** @jsx React.createElement */
const React = require('react')
const Enzyme = require('enzyme')
const ReactTestRenderer = require('react-test-renderer')

describe('React Compat Test', () => {
  it('should work', () => {
    const App = () => (
      <div>
        <h1 id="bar">Hello, world</h1>
        <span className="foo">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit.
        </span>
      </div>
    )
    const rendered = ReactTestRenderer.create(
      <App />
    )
    console.log(rendered.toTree().rendered.rendered)
  })
})
