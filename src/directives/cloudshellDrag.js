import Vue from 'vue'

// v-cloudshellDragResize: cloudshell 拖拽/resize 属性
Vue.directive('cloudshellDragResize', { // 属性名称cloudshellDragResize，前面加v- 使用
  bind (el, binding, vnode, oldVnode) {
    const minWidth = 400
    const minHeight = 300
    const dragDom = el.querySelector('.cloudshell-wrapper')
    const dialogHeaderEl = el.querySelector('.cloudshell-header')
    const headerResizeEl = el.querySelector('.header-resize-btn')
    dialogHeaderEl.style.cssText += ';cursor:move;'

    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = (function () {
      if (window.document.currentStyle) {
        return (dom, attr) => dom.currentStyle[attr]
      } else {
        return (dom, attr) => getComputedStyle(dom, false)[attr]
      }
    })()
    // 顶部拉伸按钮
    headerResizeEl.onmousedown = (e) => {
      e.preventDefault()
      const clientY = e.clientY
      const elH = dragDom.clientHeight
      const elT = dragDom.offsetTop
      document.onmousemove = function (e) {
        // 移动时禁用默认事件
        e.preventDefault()
        // 往上拉伸
        if (clientY > e.clientY) {
          if (dragDom.offsetTop < 0) {
            // dragDom.style.top = '0px'
          } else {
            dragDom.style.top = elT - (clientY - e.clientY) * 1 + 'px'
            dragDom.style.height = elH + (clientY - e.clientY) * 1 + 'px'
          }
        }
        // 往下拉伸
        if (clientY < e.clientY) {
          if (dragDom.clientHeight < minHeight) {
            // dragDom.style.height = minHeight + 'px'
          } else {
            dragDom.style.top = elT - (clientY - e.clientY) * 1 + 'px'
            dragDom.style.height = elH - (e.clientY - clientY) * 1 + 'px'
          }
        }
        binding.value()
        // 拉伸结束
        document.onmouseup = function (e) {
          document.onmousemove = null

          document.onmouseup = null
        }
      }
    }
    // 拖拽
    dialogHeaderEl.onmousedown = (e) => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop

      const screenWidth = document.body.clientWidth // body当前宽度
      const screenHeight = document.documentElement.clientHeight // 可见区域高度(应为body高度，可某些环境下无法获取)

      const dragDomWidth = dragDom.offsetWidth // 对话框宽度

      // 获取到的值带px 正则匹配替换
      let styL = sty(dragDom, 'left')
      let styT = sty(dragDom, 'top')

      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (styL.includes('%')) {
        styL = +document.body.clientWidth * (+styL.replace(/\\%/g, '') / 100)
        styT = +document.body.clientHeight * (+styT.replace(/\\%/g, '') / 100)
      } else {
        styL = +styL.replace(/\px/g, '')
        styT = +styT.replace(/\px/g, '')
      };
      if (document.onmousemove) return
      document.onmousemove = function (e) {
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX
        let top = e.clientY - disY

        // 边界处理
        if (left + styL > screenWidth - 50) {
          left = screenWidth - 50 - styL
        } else if (left + styL < -dragDomWidth + 50) {
          left = -dragDomWidth + 50 - styL
        }
        if (top + styT < 0) {
          top = -styT
        } else if (top + styT > screenHeight - 20) {
          top = screenHeight - 20 - styT
        }

        // 移动当前元素
        dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
      }

      document.onmouseup = function (e) {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
    // 整个框拉伸
    dragDom.onmousemove = function (e) {
      if (e.clientX > dragDom.offsetLeft + dragDom.clientWidth - 15 && (el.scrollTop + e.clientY > dragDom.offsetTop + dragDom.clientHeight - 15)) {
        dragDom.style.cursor = 'nw-resize'
      } else if (e.clientX < dragDom.offsetLeft + 15 && el.scrollTop + e.clientY > dragDom.offsetTop + dragDom.clientHeight - 15) {
        dragDom.style.cursor = 'ne-resize'
      } else if (el.scrollTop + e.clientY > dragDom.offsetTop + dragDom.clientHeight - 10) {
        dragDom.style.cursor = 'row-resize'
      } else {
        dragDom.style.cursor = 'default'
        dragDom.onmousedown = null
      }

      dragDom.onmousedown = e => {
        const clientX = e.clientX
        const clientY = e.clientY
        const elW = dragDom.clientWidth
        const elH = dragDom.clientHeight
        const elL = dragDom.offsetLeft
        dragDom.style.userSelect = 'none'
        const cursor = dragDom.style.cursor
        if (cursor !== 'default') {
          document.onmousemove = function (e) {
            // 移动时禁用默认事件
            e.preventDefault()
            // 往左拉伸
            if (['nw-resize', 'ne-resize'].includes(cursor) && clientX > e.clientX) {
              if (dragDom.clientWidth < minWidth) {
                // console.log()
              } else {
                if (cursor === 'ne-resize') { // 左下角
                  dragDom.style.width = elW + (clientX - e.clientX) * 1 + 'px'
                  dragDom.style.left = elL - (clientX - e.clientX) * 1 + 'px'
                } else {
                  dragDom.style.width = elW - (clientX - e.clientX) * 1 + 'px'
                }
              }
            }
            // 往右拉伸
            if (['nw-resize', 'ne-resize'].includes(cursor) && clientX < e.clientX) {
              if (dragDom.clientWidth < minWidth) {
                // console.log()
              } else {
                if (cursor === 'ne-resize') { // 左下角
                  dragDom.style.width = elW + (clientX - e.clientX) * 1 + 'px'
                  dragDom.style.left = elL - (clientX - e.clientX) * 1 + 'px'
                } else {
                  dragDom.style.width = elW - (clientX - e.clientX) * 1 + 'px'
                }
              }
            }
            // 往上拉伸
            if (clientY > e.clientY) {
              if (dragDom.clientHeight < minHeight) {
                // console.log()
              } else {
                dragDom.style.height = elH - (clientY - e.clientY) * 1 + 'px'
              }
            }
            // 往下拉伸
            if (clientY < e.clientY) {
              dragDom.style.height = elH + (e.clientY - clientY) * 1 + 'px'
            }
            binding.value()
            // 拉伸结束
            document.onmouseup = function (e) {
              document.onmousemove = null

              document.onmouseup = null
            }
          }
        }
      }
    }
  },
})
