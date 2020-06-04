import vue from 'vue'
import maskLoading from './mask.vue'

const Mask = vue.extend(maskLoading)

const toggleLoading = function (el, binding) {
  if (binding.value) {
    vue.nextTick(() => {
      if (binding.modifiers.fullscreen) {
        // 全屏情况下
        // el.instance.fullscreen = true;
        // document.body.style.overflow = "hidden";
        document.body.appendChild(el.mask)
      } else {
        // el.instance.fullscreen = false;
        // 非全屏情况下
        const rect = el.getBoundingClientRect();
        ['height', 'width'].forEach(property => {
          el.maskStyle[property] = rect[property] + 'px'
        })
        Object.keys(el.maskStyle).forEach(property => {
          el.mask.style[property] = el.maskStyle[property]
        })
        el.appendChild(el.mask)
      }
    })
  } else {
    // 移除节点
    el.mask && el.mask.parentNode && el.mask.parentNode.removeChild(el.mask)
    el.instance && el.instance.$destroy()
  }
}

export default {
  bind (el, binding) {
    let background = binding.value.background
    let text = binding.value.text
    let color = binding.value.color
    let fontSize = binding.value.fontSize
    const mask = new Mask({
      el: document.createElement('div'),
      data: {
        fullscreen: !!binding.modifiers.fullscreen,
        background: background || '255, 255, 255, 1',
        text: text || '加载中…',
        color: color || null,
        fontSize: fontSize || null,
      },
    })
    el.instance = mask // 将mask存入
    el.mask = mask.$el // dom存入，方便获取
    el.maskStyle = {}
    toggleLoading(el, binding)
  },
  // 被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
  // eslint-disable-next-line no-unused-vars
  inserted: function (el, binding, vnode, oldVnode) {
    // console.log("元素插入的时候");
  },
  // 所在组件的 VNode 更新时调用
  update (el, binding) {
    // console.log("更新了", binding);
    if (binding.oldValue !== binding.value) {
      toggleLoading(el, binding)
    }
  },
  // 指令所在组件的 VNode 及其子 VNode 全部更新后调用
  componentUpdated () {
    // console.log("渲染完成了");
  },
  // 只调用一次，指令与元素解绑时调用
  unbind (el) {
    el.mask && el.mask.parentNode && el.mask.parentNode.removeChild(el.mask)
    el.instance && el.instance.$destroy()
  },
}
