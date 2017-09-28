/** @jsx h */
const { h } = require('preact')
const PreactMountRenderer = require('../src/mount-renderer')

describe('PreactMountRenderer', () => {
  it('should work', () => {
    const renderer = new PreactMountRenderer({})
    const App = ({ name }) => <h1>Hello, {name}</h1>
    const rendered = renderer.render(<App />)
    renderer.unmount();
  })
})
