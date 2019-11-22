<template>
  <a @click="clickHandle" v-if="listInsided"><slot /></a>
  <span v-else><slot /></span>
</template>

<script>
export default {
  name: 'SidePageTrigger',
  data () {
    return {
      listInsided: false,
    }
  },
  created () {
    this.findListByParent(this.$parent)
  },
  methods: {
    clickHandle () {
      this.$emit('trigger')
    },
    findListByParent (vm) {
      if (vm.$options.name === 'PageList') {
        this.listInsided = true
      } else {
        if (vm.$parent) {
          this.findListByParent(vm.$parent)
        }
      }
    },
  },
}
</script>
