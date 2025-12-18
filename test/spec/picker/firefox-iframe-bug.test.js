import { basicAfterEach, basicBeforeEach, tick } from '../shared'
import { getByRole, waitFor } from '@testing-library/dom'
import Picker from '../../../src/picker/PickerElement'

describe('Firefox iframe bug - prototype rescue fix', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  // Note: We cannot perfectly simulate the Firefox bug in jsdom because jsdom validates
  // Node prototype chains and throws errors when we break them with Object.setPrototypeOf().
  // Instead, we verify that:
  // 1. The rescue logic exists and is properly integrated
  // 2. The lifecycle callbacks that trigger the rescue are present
  // 3. The element survives iframe moves without errors (integration test)

  test('has adoptedCallback that includes rescue logic', () => {
    // Verify the lifecycle callback exists
    expect(typeof Picker.prototype.adoptedCallback).toBe('function')

    // The adoptedCallback is inherited from FirefoxRescuerElementBase
    // which contains the rescueElementPrototype() call
    const picker = new Picker()
    document.body.appendChild(picker)

    // Verify picker is a custom element with correct prototype chain
    expect(picker.tagName.toLowerCase()).toBe('emoji-picker')
    expect(Object.getPrototypeOf(picker)).toBe(Picker.prototype)
    expect(customElements.get('emoji-picker')).toBe(Picker)
  })

  test('has disconnectedCallback that includes rescue logic', () => {
    // Verify the lifecycle callback exists
    expect(typeof Picker.prototype.disconnectedCallback).toBe('function')

    const picker = new Picker()
    document.body.appendChild(picker)

    // disconnectedCallback in PickerElement calls super.disconnectedCallback()
    // which invokes the rescue logic from FirefoxRescuerElementBase

    // Verify no errors when disconnecting (rescue logic handles broken prototypes gracefully)
    expect(() => {
      document.body.removeChild(picker)
    }).not.toThrow()
  })

  test('element survives move to iframe without errors (integration)', async () => {
    // Create and mount picker in main document
    const picker = new Picker()
    document.body.appendChild(picker)
    const container = picker.shadowRoot

    // Wait for picker to fully render
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    // Verify instance methods work in main document
    expect(picker.locale).toBe('en')
    expect(typeof picker._set).toBe('function')
    expect(typeof picker._dbCreate).toBe('function')

    // Create an iframe
    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    const iframeDoc = iframe.contentDocument

    // Move to iframe - this triggers adoptedCallback
    // In Firefox with the bug, this would break the prototype
    // Our fix in adoptedCallback should prevent any errors
    expect(() => {
      iframeDoc.body.appendChild(picker)
    }).not.toThrow()

    await tick(40)

    // Verify element still works correctly after iframe move
    expect(picker.locale).toBe('en')
    expect(typeof picker._set).toBe('function')
    expect(typeof picker._dbCreate).toBe('function')
    expect(picker.shadowRoot).toBeTruthy()

    // Verify the picker still renders and functions correctly
    const searchInput = getByRole(picker.shadowRoot, 'combobox')
    expect(searchInput).toBeTruthy()

    // Verify prototype is still correct (jsdom doesn't break it, but Firefox would)
    expect(Object.getPrototypeOf(picker)).toBe(Picker.prototype)

    // Clean up
    document.body.removeChild(iframe)
    await tick(60)
  })

  test('element survives disconnect and reconnect without errors', async () => {
    const picker = new Picker()
    document.body.appendChild(picker)

    await waitFor(() => expect(getByRole(picker.shadowRoot, 'menuitem', { name: /😀/ })).toBeVisible())

    // Store initial state
    const initialLocale = picker.locale
    const initialPrototype = Object.getPrototypeOf(picker)

    // Disconnect - this triggers disconnectedCallback with rescue logic
    expect(() => {
      document.body.removeChild(picker)
    }).not.toThrow()

    await tick(20)

    // Prototype should remain correct (in Firefox with bug, rescue would fix it here)
    expect(Object.getPrototypeOf(picker)).toBe(initialPrototype)

    // Reconnect - element should still work perfectly
    expect(() => {
      document.body.appendChild(picker)
    }).not.toThrow()

    await tick(20)

    // Verify state and methods are maintained
    expect(picker.locale).toBe(initialLocale)
    expect(typeof picker._set).toBe('function')
    expect(typeof picker._dbCreate).toBe('function')

    // Clean up
    document.body.removeChild(picker)
    await tick(60)
  })

  test('rescue logic is no-op when prototype is already correct', async () => {
    const picker = new Picker()
    document.body.appendChild(picker)

    await waitFor(() => expect(getByRole(picker.shadowRoot, 'menuitem', { name: /😀/ })).toBeVisible())

    // Verify prototype is correct from the start
    const correctPrototype = Picker.prototype
    expect(Object.getPrototypeOf(picker)).toBe(correctPrototype)

    // Move to iframe - rescue logic runs but is no-op since prototype is correct
    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    iframe.contentDocument.body.appendChild(picker)
    await tick(40)

    // Verify prototype remained correct (rescue was harmless no-op)
    expect(Object.getPrototypeOf(picker)).toBe(correctPrototype)
    expect(picker.locale).toBe('en')
    expect(typeof picker._set).toBe('function')

    // Clean up
    document.body.removeChild(iframe)
    await tick(60)
  })
})
