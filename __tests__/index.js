/** @jsx h */
const {h} = require('preact')
const Enzyme = require('enzyme')
const PreactAdapter = require('../src')

Enzyme.configure({ adapter: new PreactAdapter })

const App = () => (
  <div>
    <h1 id="bar">Hello, world</h1>
    <span className="foo">
      Lorem ipsum dolor, sit amet consectetur adipisicing elit.
    </span>
  </div>
)

describe('preact-enzyme-adapter', () => {
  it('should work', () => {
    const wrapper = Enzyme.mount(<App />)
    expect(wrapper.find('h1 + span.foo').length).toBe(1)
    expect(wrapper.find('h1[id="bar"]').length).toBe(1)
    expect(wrapper.find('h1').is('h1')).toBe(true)
  })
});