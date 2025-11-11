import Vue from 'vue'

// v-cloudshellDragResize: cloudshell 拖拽/resize 属性
Vue.directive('cloudshellDragResize', { // 属性名称cloudshellDragResize，前面加v- 使用
  bind (el, binding, vnode, oldVnode) {
    // const minWidth = 400
    const awaiHeight = document.body.offsetHeight - 60
    const minHeight = 25
    const containerDom = el
    const dragDom = el.querySelector('.cloudshell-wrapper')
    // const dialogHeaderEl = el.querySelector('.cloudshell-header')
    // const headerResizeEl = el.querySelector('.header-resize-btn')
    // dialogHeaderEl.style.cssText += ';cursor:move;'
    // let initL = 5
    // let initT = document.body.clientHeight - 355
    // let initW = document.body.clientWidth - 10
    // let initH = 350

    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    // const sty = (function () {
    //   if (window.document.currentStyle) {
    //     return (dom, attr) => dom.currentStyle[attr]
    //   } else {
    //     return (dom, attr) => getComputedStyle(dom, false)[attr]
    //   }
    // })()
    // 顶部拉伸按钮
    // headerResizeEl.onmousedown = (e) => {
    //   e.preventDefault()
    //   const clientY = e.clientY
    //   const elH = dragDom.clientHeight
    //   // const elT = dragDom.offsetTop
    //   document.onmousemove = function (e) {
    //     // 移动时禁用默认事件
    //     e.preventDefault()
    //     // 往上拉伸
    //     if (clientY > e.clientY) {
    //       if (dragDom.offsetTop < 0) {
    //         // dragDom.style.top = '0px'
    //       } else if (Math.max(elH + (clientY - e.clientY) * 1, minHeight) > awaiHeight) {
    //         containerDom.style.flex = `0 0 ${awaiHeight}px`
    //         containerDom.style.height = awaiHeight + 'px'
    //         dragDom.style.height = awaiHeight + 'px'
    //         dragDom.style.flex = `0 0 ${awaiHeight}px`
    //       } else {
    //         // dragDom.style.top = elT - (clientY - e.clientY) * 1 + 'px'
    //         containerDom.style.flex = `0 0 ${Math.max(elH + (clientY - e.clientY) * 1, minHeight)}px`
    //         containerDom.style.height = Math.max(elH + (clientY - e.clientY) * 1, minHeight) + 'px'
    //         dragDom.style.height = Math.max(elH + (clientY - e.clientY) * 1, minHeight) + 'px'
    //         dragDom.style.flex = `0 0 ${Math.max(elH + (clientY - e.clientY) * 1, minHeight)}px`
    //       }
    //     }
    //     // 往下拉伸
    //     if (clientY < e.clientY) {
    //       if (dragDom.clientHeight < minHeight) {
    //         // dragDom.style.height = minHeight + 'px'
    //       } else {
    //         // dragDom.style.top = elT - (clientY - e.clientY) * 1 + 'px'\
    //         containerDom.style.flex = `0 0 ${Math.max(elH - (e.clientY - clientY) * 1, minHeight)}px`
    //         containerDom.style.height = Math.max(elH - (e.clientY - clientY) * 1, minHeight) + 'px'
    //         dragDom.style.height = Math.max(elH - (e.clientY - clientY) * 1, minHeight) + 'px'
    //         dragDom.style.flex = `0 0 ${Math.max(elH - (e.clientY - clientY) * 1, minHeight)}px`
    //       }
    //     }
    //     binding.value()
    //     // 拉伸结束
    //     document.onmouseup = function (e) {
    //       document.onmousemove = null

    //       document.onmouseup = null
    //     }
    //   }
    // }
    // 拖拽
    // dialogHeaderEl.onmousedown = (e) => {
    //   // 鼠标按下，计算当前元素距离可视区的距离
    //   const disX = e.clientX - dialogHeaderEl.offsetLeft
    //   const disY = e.clientY - dialogHeaderEl.offsetTop

    //   const screenWidth = document.body.clientWidth // body当前宽度
    //   const screenHeight = document.documentElement.clientHeight // 可见区域高度(应为body高度，可某些环境下无法获取)

    //   const dragDomWidth = dragDom.offsetWidth // 对话框宽度

    //   // 获取到的值带px 正则匹配替换
    //   let styL = sty(dragDom, 'left')
    //   let styT = sty(dragDom, 'top')

    //   // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
    //   if (styL.includes('%')) {
    //     styL = +document.body.clientWidth * (+styL.replace(/\\%/g, '') / 100)
    //     styT = +document.body.clientHeight * (+styT.replace(/\\%/g, '') / 100)
    //   } else {
    //     styL = +styL.replace(/\px/g, '')
    //     styT = +styT.replace(/\px/g, '')
    //   };
    //   if (document.onmousemove) return
    //   document.onmousemove = function (e) {
    //     // 通过事件委托，计算移动的距离
    //     let left = e.clientX - disX
    //     let top = e.clientY - disY

    //     // 边界处理
    //     if (left + styL > screenWidth - 50) {
    //       left = screenWidth - 50 - styL
    //     } else if (left + styL < -dragDomWidth + 50) {
    //       left = -dragDomWidth + 50 - styL
    //     }
    //     if (top + styT < 0) {
    //       top = -styT
    //     } else if (top + styT > screenHeight - 20) {
    //       top = screenHeight - 20 - styT
    //     }

    //     // 移动当前元素
    //     dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
    //   }

    //   document.onmouseup = function (e) {
    //     document.onmousemove = null
    //     document.onmouseup = null
    //   }
    // }
    // document.onmouseup = function (e) {
    //   document.onmousemove = null
    //   document.onmouseup = null
    // }
    // // header双击操作
    // dialogHeaderEl.ondblclick = function (e) {
    //   if (dragDom.offsetLeft === 5 && dragDom.offsetTop === document.body.clientHeight - 355 && dragDom.clientWidth === document.body.clientWidth - 10 && dragDom.clientHeight === 350) {
    //     if (initL === 5 && initT === document.body.clientHeight - 355 && initW === document.body.clientWidth - 10 && initH === 350) {
    //       // 初始状态
    //     } else {
    //       // 恢复上一个状态
    //       dragDom.style.left = initL + 'px'
    //       dragDom.style.top = initT + 'px'
    //       dragDom.style.width = initW + 'px'
    //       dragDom.style.height = initH + 'px'
    //     }
    //   } else {
    //     // 记录当前状态
    //     initL = dragDom.offsetLeft
    //     initT = dragDom.offsetTop
    //     initW = dragDom.clientWidth
    //     initH = dragDom.clientHeight
    //     // 恢复初始状态
    //     dragDom.style.left = 5 + 'px'
    //     dragDom.style.top = document.body.clientHeight - 355 + 'px'
    //     dragDom.style.width = 'calc(100vw - 10px)'
    //     dragDom.style.height = 350 + 'px'
    //   }
    //   binding.value()
    // }
    // // 整个框拉伸
    dragDom.onmousemove = function (e) {
      const top = dragDom.getBoundingClientRect().top
      if (e.clientY < top + 15) {
        dragDom.style.cursor = 'row-resize'
      } else {
        dragDom.style.cursor = 'default'
        dragDom.onmousedown = null
      }
      // if (el.scrollTop + e.clientY > dragDom.offsetTop + dragDom.clientHeight - 10) {
      //   dragDom.style.cursor = 'row-resize'
      // } else if (e.clientX < dragDom.offsetLeft + 15) {
      //   dragDom.style.cursor = 'col-resize'
      // } else if (e.clientX > dragDom.offsetLeft + dragDom.clientWidth - 15) {
      //   dragDom.style.cursor = 'col-resize'
      // } else {
      //   dragDom.style.cursor = 'default'
      //   dragDom.onmousedown = null
      // }

      dragDom.onmousedown = e => {
        // const clientX = e.clientX
        const clientY = e.clientY
        // const elW = dragDom.clientWidth
        const elH = dragDom.clientHeight
        // const elL = dragDom.offsetLeft
        dragDom.style.userSelect = 'none'
        const cursor = dragDom.style.cursor
        if (cursor !== 'default') {
          document.onmousemove = function (e) {
            // 移动时禁用默认事件
            e.preventDefault()
            // 往左拉伸
            // if (cursor === 'col-resize' && clientX > e.clientX) {
            //   if (dragDom.clientWidth < minWidth) {
            //     // console.log()
            //   } else {
            //     if (Math.abs(clientX - elL) < 20) { // 左
            //       dragDom.style.width = Math.max(elW + (clientX - e.clientX) * 1, minWidth) + 'px'
            //       dragDom.style.left = elL - (clientX - e.clientX) * 1 + 'px'
            //     } else {
            //       dragDom.style.width = Math.max(elW - (clientX - e.clientX) * 1, minWidth) + 'px'
            //     }
            //   }
            // }
            // // 往右拉伸
            // if (cursor === 'col-resize' && clientX < e.clientX) {
            //   if (dragDom.clientWidth < minWidth) {
            //     // console.log()
            //   } else {
            //     if (Math.abs(clientX - elL) < 20) { // 右
            //       dragDom.style.width = Math.max(elW + (clientX - e.clientX) * 1, minWidth) + 'px'
            //       dragDom.style.left = elL - (clientX - e.clientX) * 1 + 'px'
            //     } else {
            //       dragDom.style.width = Math.max(elW - (clientX - e.clientX) * 1, minWidth) + 'px'
            //     }
            //   }
            // }
            // 往上拉伸
            if (clientY > e.clientY) {
              if (dragDom.offsetTop < 0) {
                // dragDom.style.top = '0px'
              } else if (Math.max(elH + (clientY - e.clientY) * 1, minHeight) > awaiHeight) {
                containerDom.style.flex = `0 0 ${awaiHeight}px`
                containerDom.style.height = awaiHeight + 'px'
                dragDom.style.height = awaiHeight + 'px'
                dragDom.style.flex = `0 0 ${awaiHeight}px`
              } else {
                // dragDom.style.top = elT - (clientY - e.clientY) * 1 + 'px'
                containerDom.style.flex = `0 0 ${Math.max(elH + (clientY - e.clientY) * 1, minHeight)}px`
                containerDom.style.height = Math.max(elH + (clientY - e.clientY) * 1, minHeight) + 'px'
                dragDom.style.height = Math.max(elH + (clientY - e.clientY) * 1, minHeight) + 'px'
                dragDom.style.flex = `0 0 ${Math.max(elH + (clientY - e.clientY) * 1, minHeight)}px`
              }
            }
            // 往下拉伸
            if (clientY < e.clientY) {
              if (dragDom.clientHeight < minHeight) {
                // dragDom.style.height = minHeight + 'px'
              } else {
                // dragDom.style.top = elT - (clientY - e.clientY) * 1 + 'px'\
                containerDom.style.flex = `0 0 ${Math.max(elH - (e.clientY - clientY) * 1, minHeight)}px`
                containerDom.style.height = Math.max(elH - (e.clientY - clientY) * 1, minHeight) + 'px'
                dragDom.style.height = Math.max(elH - (e.clientY - clientY) * 1, minHeight) + 'px'
                dragDom.style.flex = `0 0 ${Math.max(elH - (e.clientY - clientY) * 1, minHeight)}px`
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
        document.onmouseup = function (e) {
          document.onmousemove = null

          document.onmouseup = null
        }
      }
    }
  },
})
