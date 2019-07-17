import Quill from '../quill.js'
const Inline = Quill.import('blots/inline')

class InlineStrong extends Inline {
  static blotName = 'inline-strong'
  static tagName = 'a'

  static create ({ title, code }) {
    let node = super.create()
    node.setAttribute('data-title', title)
    node.setAttribute('data-code', code)
    node.classList.add('inline-verse')
    return node
  }

  static formats (domNode) {
    return {
      title: domNode.getAttribute('data-title'),
      code: domNode.getAttribute('data-code')
    }
  }
}

Quill.register(InlineStrong)

export default InlineStrong
