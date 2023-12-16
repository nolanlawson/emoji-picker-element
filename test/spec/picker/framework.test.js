import { createFramework } from '../../../src/picker/components/Picker/framework.js'

describe('framework', () => {
  test('patches a node', () => {
    const state = { name: 'foo' }

    const { html } = createFramework(state)

    let node
    const render = () => {
      node = html`<div>${html`<span>${state.name}</span>`}</div>`
    }

    render()
    expect(node.outerHTML).toBe('<div><span>foo</span></div>')

    state.name = 'bar'
    render()
    expect(node.outerHTML).toBe('<div><span>bar</span></div>')
  })

  test('replaces one node with a totally different one', () => {
    const state = { name: 'foo' }

    const { html } = createFramework(state)

    let node
    const render = () => {
      node = html`<div>${
        state.name === 'foo' ? html`<span>${state.name}</span>` : html`<button>${state.name}</button>`
      }</div>`
    }

    render()
    expect(node.outerHTML).toBe('<div><span>foo</span></div>')

    state.name = 'bar'
    render()
    expect(node.outerHTML).toBe('<div><button>bar</button></div>')
  })

  test('return the same exact node after a re-render', () => {
    const state = { name: 'foo' }

    const { html } = createFramework(state)

    let node
    let cached
    const render = () => {
      cached = cached ?? html`<span>${state.name}</span>`
      node = html`<div>${cached}</div>`
    }

    render()
    expect(node.outerHTML).toBe('<div><span>foo</span></div>')

    render()
    expect(node.outerHTML).toBe('<div><span>foo</span></div>')
  })

  test('render two dynamic expressions inside the same element', () => {
    const state = { name1: 'foo', name2: 'bar' }

    const { html } = createFramework(state)

    let node
    const render = () => {
      node = html`<div>${state.name1}${state.name2}</div>`
    }

    render()
    expect(node.outerHTML).toBe('<div>foobar</div>')

    state.name1 = 'baz'
    state.name2 = 'quux'
    render()
    expect(node.outerHTML).toBe('<div>bazquux</div>')
  })

  test('render a mix of dynamic and static text nodes in the same element', () => {
    const state = { name1: 'foo', name2: 'bar' }

    const { html } = createFramework(state)

    let node
    const render = () => {
      node = html`<div>1${state.name1}2${state.name2}3</div>`
    }

    render()
    expect(node.outerHTML).toBe('<div>1foo2bar3</div>')

    state.name1 = 'baz'
    state.name2 = 'quux'
    render()
    expect(node.outerHTML).toBe('<div>1baz2quux3</div>')
  })
})
