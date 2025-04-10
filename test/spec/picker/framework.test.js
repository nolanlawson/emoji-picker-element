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

  test('dynamic expression with whitespace around it - minifier should be working', () => {
    const state = { name: 'foo' }

    const { html } = createFramework(state)

    let node
    const render = () => {
      node = html`<div>  ${state.name}\t\n</div>`
    }

    render()
    expect(node.outerHTML).toBe('<div>foo</div>')

    state.name = 'baz'
    render()
    expect(node.outerHTML).toBe('<div>baz</div>')
  })

  test('set to undefined then something then back to undefined', () => {
    const state = { value: undefined }
    const { html } = createFramework(state)

    let node
    const render = () => {
      node = html`<div aria-selected=${state.value}></div>`
    }

    render()
    expect(node.getAttribute('aria-selected')).toBe(null)

    state.value = true
    render()
    expect(node.getAttribute('aria-selected')).toBe('true')

    state.value = undefined
    render()
    expect(node.getAttribute('aria-selected')).toBe(null)
  })

  test('set to undefined then something then back to undefined - with quotes', () => {
    const state = { value: undefined }
    const { html } = createFramework(state)

    let node
    const render = () => {
      node = html`<div aria-selected="${state.value}"></div>`
    }

    render()
    expect(node.getAttribute('aria-selected')).toBe(null)

    state.value = true
    render()
    expect(node.getAttribute('aria-selected')).toBe('true')

    state.value = undefined
    render()
    expect(node.getAttribute('aria-selected')).toBe(null)
  })

  test('set to undefined - with pre/post text', () => {
    const state = { value: undefined }
    const { html } = createFramework(state)

    const renders = [
      () => html`
        <div class="foo ${state.value}"></div>`,
      () => html`
        <div class="${state.value} bar"></div>`,
      () => html`
        <div class="foo ${state.value} bar"></div>`
    ]
    for (const render of renders) {
      expect(render).toThrow(/framework does not support undefined expressions with attribute pre\/post/)
    }
  })

  test('set expression to undefined/null', () => {
    const state = {}
    const { html } = createFramework(state)

    const renders = [
      () => html`<div class="${state.value}"></div>`,
      () => html`<div class=${state.value}></div>`,
      () => html`<div class="foo ${state.value}"></div>`,
      () => html`<div class="${state.value} bar"></div>`,
      () => html`<div class="foo ${state.value} bar"></div>`,
      () => html`<div>${state.value}</div>`,
      () => html`<div>foo ${state.value}</div>`,
      () => html`<div>${state.value} bar</div>`,
      () => html`<div>foo ${state.value} bar</div>`
    ]

    state.value = undefined
    for (const render of renders) {
      expect(render).toThrow(/framework does not support undefined or null expressions/)
    }

    state.value = null
    for (const render of renders) {
      expect(render).toThrow(/framework does not support undefined or null expressions/)
    }
  })

  // Framework no longer supports this since we switched from HTML comments to text nodes
  test.skip('render two dynamic expressions inside the same element', () => {
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

  // Framework no longer supports this since we switched from HTML comments to text nodes
  test.skip('render a mix of dynamic and static text nodes in the same element', () => {
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

  test('attributes', () => {
    const state = {}

    const { html } = createFramework(state)

    const expectRender = (render, expected1, expected2) => {
      state.name = 'foo'
      expect(render().outerHTML).toBe(expected1)

      state.name = 'bar'
      expect(render().outerHTML).toBe(expected2)
    }

    expectRender(() => html`<div class="${state.name}"></div>`, '<div class="foo"></div>', '<div class="bar"></div>')
    expectRender(() => html`<div class=${state.name}></div>`, '<div class="foo"></div>', '<div class="bar"></div>')

    // pre
    expectRender(() => html`<div class="a${state.name}"></div>`, '<div class="afoo"></div>', '<div class="abar"></div>')
    expectRender(() => html`<div class=a${state.name}></div>`, '<div class="afoo"></div>', '<div class="abar"></div>')

    // post
    expectRender(() => html`<div class="${state.name}z"></div>`, '<div class="fooz"></div>', '<div class="barz"></div>')
    expectRender(() => html`<div class=${state.name}z></div>`, '<div class="fooz"></div>', '<div class="barz"></div>')

    // pre+post
    expectRender(() => html`<div class="a${state.name}z"></div>`, '<div class="afooz"></div>', '<div class="abarz"></div>')
    expectRender(() => html`<div class=a${state.name}z></div>`, '<div class="afooz"></div>', '<div class="abarz"></div>')
  })

  test('map', () => {
    const state = {}
    const { html, map } = createFramework(state)

    const items = [{ id: 2 }, { id: 1 }, { id: 3 }]

    const expectRender = expected => {
      const rendered = map(items, (item) => html`<div>${item.id}</div>`, item => item.id)

      expect(rendered.map(_ => _.outerHTML)).toEqual(expected)
    }

    expectRender(['<div>2</div>', '<div>1</div>', '<div>3</div>'])

    items.sort((a, b) => a.id - b.id)
    expectRender(['<div>1</div>', '<div>2</div>', '<div>3</div>'])

    items.sort((a, b) => b.id - a.id)
    expectRender(['<div>3</div>', '<div>2</div>', '<div>1</div>'])

    items.push({ id: 4 })
    expectRender(['<div>3</div>', '<div>2</div>', '<div>1</div>', '<div>4</div>'])
  })

  test('one binding not at top level', () => {
    const state = {}
    const { html } = createFramework(state)
    const render = () => html`<div><div class="${state.name}"></div></div>`

    state.name = 'foo'
    expect(render().outerHTML).toBe('<div><div class="foo"></div></div>')
  })
})
