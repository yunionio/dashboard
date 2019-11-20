<template>
  <a-tag class="tag" :closable="focus" @close="handleClose($event)">{{ label }}</a-tag>
</template>

<script>
export default {
  name: 'Tag',
  props: {
    value: {
      type: Array,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    focus: {
      type: Boolean,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
    keySeparator: {
      type: String,
      required: true,
    },
    valueSeparator: {
      type: String,
      required: true,
    },
  },
  computed: {
    label () {
      let label = this.options[this.id]['label']
      let ret = `${label}${this.keySeparator}`
      ret += this.value.map(value => {
        if (this.options[this.id]['items']) {
          const target = this.options[this.id]['items'].find(item => item.key === value)
          if (target) return target.label
        }
        return value
      }).filter(item => !!item).join(this.valueSeparator)
      return ret
    },
  },
  methods: {
    handleClose (e) {
      e.stopPropagation()
      this.$emit('remove', this.id)
    },
  },
}
</script>

<style lang="scss" scoped>
.tag {
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
}
</style>
