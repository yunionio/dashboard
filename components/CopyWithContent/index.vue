<template>
  <div v-on="events">
    <slot />
    <copy v-if="showCopyButton" :message="message" class="ml-1" />
  </div>
</template>

<script>
export default {
  name: 'CopyWithContent',
  props: {
    message: {
      type: String,
      required: true,
    },
    alwaysShowCopyButton: {
      type: Boolean,
    },
  },
  data () {
    return {
      showCopyButton: this.alwaysShowCopyButton,
    }
  },
  created () {
    this.events = {}
    if (!this.alwaysShowCopyButton) {
      this.events.mouseenter = this.handleMouseenter
      this.events.mouseleave = this.handleMouseleave
    }
  },
  methods: {
    handleMouseenter (e) {
      e.stopPropagation()
      e.preventDefault()
      if (!this.showCopyButton) this.showCopyButton = true
    },
    handleMouseleave (e) {
      e.stopPropagation()
      e.preventDefault()
      if (this.showCopyButton) this.showCopyButton = false
    },
  },
}
</script>
