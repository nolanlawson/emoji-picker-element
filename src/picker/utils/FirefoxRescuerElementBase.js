// Workaround for Firefox bug where custom elements lose their prototype when moved to iframes
// See: https://bugzilla.mozilla.org/show_bug.cgi?id=1502814
// Solution based on: https://github.com/jakearchibald/jakearchibald.com/blob/main/static-build/posts/2025/02/firefox-custom-elements-iframes-bug/index.md

function rescueElementPrototype (element) {
  // Get the custom element constructor from the registry
  const constructor = customElements.get(element.tagName.toLowerCase())

  // If no constructor found, element isn't registered - nothing to rescue
  if (!constructor) return

  // Check if the element's prototype is correct
  if (Object.getPrototypeOf(element) === constructor.prototype) return

  // Firefox bug detected - restore the correct prototype
  Object.setPrototypeOf(element, constructor.prototype)
}

export default class FirefoxRescuerElementBase extends HTMLElement {
  // Called when element is moved to a new document (e.g., into an iframe)
  // This catches the bug when element goes directly to iframe without being in main document first
  adoptedCallback () {
    rescueElementPrototype(this)
  }

  // Called when element is disconnected from a document
  // This happens before adoptedCallback when moving between documents
  // We need to fix the prototype here to avoid errors in subclass disconnectedCallback
  disconnectedCallback () {
    rescueElementPrototype(this)
  }
}
