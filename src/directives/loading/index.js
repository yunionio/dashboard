import Vue from 'vue'
import { addClass, removeClass, getStyle } from '@/utils/dom'
import afterLeave from '@/utils/after-leave'
import Loading from './mask.vue'

const Mask = Vue.extend(Loading)

const toggleLoading = (el, binding) => {
  if (binding.value) {
    Vue.nextTick(() => {
      if (binding.modifiers.fullscreen) {
        el.originalPosition = getStyle(document.body, 'position')
        el.originalOverflow = getStyle(document.body, 'overflow')
        el.maskStyle.zIndex = 2400

        addClass(el.mask, 'oc-mask-fullscreen')
        insertDom(document.body, el, binding)
      } else {
        removeClass(el.mask, 'oc-mask-fullscreen')

        if (binding.modifiers.body) {
          el.originalPosition = getStyle(document.body, 'position');

          ['top', 'left'].forEach(property => {
            const scroll = property === 'top' ? 'scrollTop' : 'scrollLeft'
            el.maskStyle[property] = el.getBoundingClientRect()[property] +
              document.body[scroll] +
              document.documentElement[scroll] -
              parseInt(getStyle(document.body, `margin-${property}`), 10) +
              'px'
          });
          ['height', 'width'].forEach(property => {
            el.maskStyle[property] = el.getBoundingClientRect()[property] + 'px'
          })

          insertDom(document.body, el, binding)
        } else {
          el.originalPosition = getStyle(el, 'position')
          insertDom(el, el, binding)
        }
      }
    })
  } else {
    afterLeave(el.instance, _ => {
      if (!el.instance.hiding) return
      el.domVisible = false
      const target = binding.modifiers.fullscreen || binding.modifiers.body
        ? document.body
        : el
      removeClass(target, 'position-relative')
      removeClass(target, 'overflow-hidden')
      el.instance.hiding = false
    }, 300, true)
    el.instance.visible = false
    el.instance.hiding = true
  }
}
const insertDom = (parent, el, binding) => {
  if (!el.domVisible && getStyle(el, 'display') !== 'none' && getStyle(el, 'visibility') !== 'hidden') {
    Object.keys(el.maskStyle).forEach(property => {
      el.mask.style[property] = el.maskStyle[property]
    })

    if (el.originalPosition !== 'absolute' && el.originalPosition !== 'fixed') {
      addClass(parent, 'position-relative')
    }
    if (binding.modifiers.fullscreen && binding.modifiers.lock) {
      addClass(parent, 'overflow-hidden')
    }
    el.domVisible = true

    parent.appendChild(el.mask)
    Vue.nextTick(() => {
      if (el.instance.hiding) {
        el.instance.$emit('after-leave')
      } else {
        el.instance.visible = true
      }
    })
    el.domInserted = true
  } else if (el.domVisible && el.instance.hiding === true) {
    el.instance.visible = true
    el.instance.hiding = false
  }
}

export default {
  bind: function (el, binding, vnode) {
    const textExr = binding.value.text
    const backgroundExr = binding.value.background
    const vm = vnode.context
    const mask = new Mask({
      el: document.createElement('div'),
      data: {
        text: (vm && vm[textExr]) || textExr,
        background: (vm && vm[backgroundExr]) || backgroundExr,
        fullscreen: !!binding.modifiers.fullscreen,
      },
    })
    el.instance = mask
    el.mask = mask.$el
    el.maskStyle = {}

    binding.value && toggleLoading(el, binding)
  },

  update: function (el, binding) {
    if (binding.oldValue !== binding.value) {
      toggleLoading(el, binding)
    }
  },

  unbind: function (el, binding) {
    if (el.domInserted) {
      el.mask &&
      el.mask.parentNode &&
      el.mask.parentNode.removeChild(el.mask)
      toggleLoading(el, { value: false, modifiers: binding.modifiers })
    }
    el.instance && el.instance.$destroy()
  },
}
