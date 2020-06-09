<template>
  <div
    v-if="customViewport"
    class="floating-scroll-viewport">
    <slot name="viewport-before" />
    <div
      ref="scrollBody"
      class="floating-scroll-body"
      @scroll="checkVisibility">
      <slot name="body-before" />
      <div
        ref="container"
        class="floating-scroll-area"
        :class="{'floating-scroll-unobtrusive': unobtrusive}"
        @scroll="handleContainerScroll"
        @focusin="handleContainerFocus">
        <slot />
        <div
          ref="widget"
          class="floating-scroll"
          :class="{'floating-scroll-hidden': !visible}"
          @scroll="handleWidgetScroll">
          <div ref="strut" />
        </div>
      </div>
      <slot name="body-after" />
    </div>
    <slot name="viewport-after" />
  </div>
  <div
    v-else
    ref="container"
    class="floating-scroll-area"
    :class="{ 'floating-scroll-unobtrusive': unobtrusive }"
    @scroll="handleContainerScroll"
    @focusin="handleContainerFocus">
    <slot />
    <div
      ref="widget"
      class="floating-scroll"
      :class="{ 'floating-scroll-hidden': !visible, 'opacity-0': hiddenScrollbar }"
      @scroll="handleWidgetScroll">
      <div ref="strut" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'FloatingScroll',
  props: {
    customViewport: {
      type: Boolean,
      default: false,
    },
    unobtrusive: {
      type: Boolean,
      default: false,
    },
    hiddenScrollbar: { // 隐藏滚动条
      type: Boolean,
      default: false,
    },
  },
  // These two flags below need no reactivity
  skipSyncContainer: false,
  skipSyncWidget: false,
  data () {
    return {
      visible: true,
    }
  },
  mounted () {
    this.queueUpdate().then(() => {
      this.addEventHandlers()
    })
  },
  methods: {
    queueUpdate () {
      const instance = this
      return instance.$nextTick().then(() => {
        // Recalculate scrollbar parameters and set its visibility
        instance.update()
        // Set skipSync flags to their initial values (because update() above calls syncWidget())
        instance.$options.skipSyncContainer = instance.$options.skipSyncWidget = false
      })
    },
    addEventHandlers () {
      const instance = this
      if (!instance.$refs.scrollBody) {
        const onScroll = () => instance.checkVisibility()
        const onResize = () => instance.update()
        window.addEventListener('scroll', onScroll, false)
        window.addEventListener('resize', onResize, false)
        instance.$once('hook:beforeDestroy', () => {
          window.removeEventListener('scroll', onScroll, false)
          window.removeEventListener('resize', onResize, false)
        })
      }
      this.$bus.$on('FloatingScrollUpdate', ({ sourceElement } = {}) => {
        if (!sourceElement || instance.$el.contains(sourceElement)) {
          instance.queueUpdate()
        }
      }, this)
    },
    handleWidgetScroll () {
      const instance = this
      if (instance.visible && !instance.$options.skipSyncContainer) {
        instance.syncContainer()
      }
      // Resume widget->container syncing after the widget scrolling has finished
      // (it might be temporally disabled by the container while syncing the widget)
      instance.$options.skipSyncContainer = false
    },
    handleContainerScroll () {
      const instance = this
      if (!instance.$options.skipSyncWidget) {
        instance.syncWidget()
      }
      // Resume container->widget syncing after the container scrolling has finished
      // (it might be temporally disabled by the widget while syncing the container)
      instance.$options.skipSyncWidget = false
    },
    handleContainerFocus () {
      setTimeout(() => this.syncWidget(), 0)
    },
    checkVisibility () {
      const instance = this
      const { widget, container, scrollBody } = instance.$refs
      let mustHide = (widget.scrollWidth <= widget.offsetWidth)
      if (!mustHide) {
        const containerRect = container.getBoundingClientRect()
        const maxVisibleY = scrollBody
          ? scrollBody.getBoundingClientRect().bottom
          : window.innerHeight || document.documentElement.clientHeight
        mustHide = ((containerRect.bottom <= maxVisibleY) || (containerRect.top > maxVisibleY))
      }
      if (instance.visible === mustHide) {
        // This will toggle class “floating-scroll-hidden” on the widget element
        instance.visible = !mustHide
      }
    },
    syncContainer () {
      const { widget, container } = this.$refs
      const { scrollLeft } = widget
      if (container.scrollLeft !== scrollLeft) {
        // Prevents container’s “scroll” event handler from syncing back again widget scroll position
        this.$options.skipSyncWidget = true
        // Note that this makes container’s “scroll” event handlers execute
        container.scrollLeft = scrollLeft
      }
    },
    syncWidget () {
      const { widget, container } = this.$refs
      const { scrollLeft } = container
      if (widget.scrollLeft !== scrollLeft) {
        // Prevents widget’s “scroll” event handler from syncing back again container scroll position
        this.$options.skipSyncContainer = true
        // Note that this makes widget’s “scroll” event handlers execute
        widget.scrollLeft = scrollLeft
      }
    },
    // Recalculate scroll width and container boundaries
    update () {
      const { widget, strut, container, scrollBody } = this.$refs
      const { style: widgetStyle } = widget
      const { clientWidth, scrollWidth } = container
      widgetStyle.width = `${clientWidth}px`
      if (!scrollBody) {
        widgetStyle.left = `${container.getBoundingClientRect().left}px`
      }
      strut.style.width = `${scrollWidth}px`
      // Fit widget height to the native scrollbar height if needed
      if (scrollWidth > clientWidth) {
        widgetStyle.height = `${widget.offsetHeight - widget.clientHeight + 1}px` // +1px JIC
      }
      this.syncWidget()
      this.checkVisibility() // fixes issue Amphiluke/floating-scroll#2
    },
  },
}
</script>

<style scoped>
.floating-scroll {
  bottom: 0;
  min-height: 17px;
  overflow: auto;
  position: fixed;
}
.floating-scroll div {
  height: 1px;
  overflow: hidden;
  pointer-events: none;
}
.floating-scroll div:before {
  content: "\A0";
}
.floating-scroll,
.floating-scroll div {
  font-size: 1px;
  line-height: 0;
  margin: 0;
  padding: 0;
}
.floating-scroll-hidden {
  bottom: 9999px;
}
.floating-scroll-hidden div:before {
  content: "\A0\A0";
}
.floating-scroll-viewport {
  position: relative;
}
.floating-scroll-body,
.floating-scroll-area {
  overflow: auto;
}
.floating-scroll-viewport .floating-scroll {
  left: 0;
  position: absolute;
}
.floating-scroll-unobtrusive .floating-scroll {
  opacity: 0;
  transition: opacity 0.5s ease 0.3s;
}
.floating-scroll-unobtrusive:hover .floating-scroll {
  opacity: 1;
}
</style>
