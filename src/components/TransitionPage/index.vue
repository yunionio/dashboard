<template>
  <transition
    :name="transitionName"
    :mode="transitionMode"
    :enter-active-class="transitionEnterActiveClass"
    @beforeLeave="beforeLeave"
    @enter="enter"
    @afterEnter="afterEnter">
    <slot />
  </transition>
</template>

<script>
const DEFAULT_TRANSITION = 'fade'
const DEFAULT_TRANSITION_MODE = 'out-in'
export default {
  name: 'TransitionPage',
  data () {
    return {
      prevHeight: 0,
      transitionName: DEFAULT_TRANSITION,
      transitionMode: DEFAULT_TRANSITION_MODE,
      transitionEnterActiveClass: '',
    }
  },
  created () {
    this.$router.beforeEach((to, from, next) => {
      let transitionName = to.meta.transitionName || from.meta.transitionName || DEFAULT_TRANSITION
      if (transitionName === 'slide') {
        const toDepth = to.path.split('/').length
        const fromDepth = from.path.split('/').length
        transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
      }
      this.transitionMode = DEFAULT_TRANSITION_MODE
      this.transitionEnterActiveClass = `${transitionName}-enter-active`
      if (to.meta.transitionName === 'zoom') {
        this.transitionMode = 'in-out'
        this.transitionEnterActiveClass = 'zoom-enter-active'
        document.body.style.overflow = 'hidden'
      }
      if (from.meta.transitionName === 'zoom') {
        this.transitionMode = null
        this.transitionEnterActiveClass = null
        document.body.style.overflow = null
      }
      this.transitionName = transitionName
      next()
    })
  },
  methods: {
    beforeLeave (element) {
      this.prevHeight = getComputedStyle(element).height
    },
    enter (element) {
      const { height } = getComputedStyle(element)
      // eslint-disable-next-line no-param-reassign
      element.style.height = this.prevHeight
      setTimeout(() => {
        // eslint-disable-next-line no-param-reassign
        element.style.height = height
      })
    },
    afterEnter (element) {
      // eslint-disable-next-line no-param-reassign
      element.style.height = 'auto'
    },
  },
}
</script>

<style lang="less" scoped>
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: height, opacity;
  transition-timing-function: ease;
  overflow: hidden;
}
.fade-enter,
.fade-leave-active {
  opacity: 0
}
.slide-left-enter-active {
  animation-name: slide-left-in;
  animation-duration: .3s;
}
.slide-left-leave-active {
  animation-name: slide-left-out;
  animation-duration: .3s;
}
.slide-right-enter-active {
  animation-name: slide-right-in;
  animation-duration: .3s;
}
.slide-right-leave-active {
  animation-name: slide-right-out;
  animation-duration: .3s;
}
.zoom-enter-active,
.zoom-leave-active {
  animation-duration: 0.5s;
  animation-fill-mode: both;
  animation-name: zoom;
}
.zoom-leave-active {
  animation-direction: reverse;
}
@keyframes slide-left-in {
  0% {
    transform: translate3d(100%, 0, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
    height: auto;
  }
}
@keyframes slide-left-out {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
    height: auto;
  }
  100% {
    transform: translate3d(-100%, 0, 0);
    opacity: 0;
  }
}
@keyframes slide-right-in {
  0% {
    transform: translate3d(-100%, 0, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
    height: auto;
  }
}
@keyframes slide-right-out {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
    height: auto;
  }
  100% {
    transform: translate3d(100%, 0, 0);
    opacity: 0;
  }
}
@keyframes zoom {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  100% {
    opacity: 1;
  }
}
</style>
