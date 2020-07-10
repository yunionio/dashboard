<template>
  <a-tooltip placement="right">
    <template v-slot:title>
      <div v-html="content" class="help-tooltip-content-wrap" />
    </template>
    <template v-slot:default>
      <icon type="question" />
    </template>
  </a-tooltip>
</template>

<script>
import helpCn from '@/locales/help-zh-CN'

const { help: helpMap } = helpCn

export default {
  name: 'HelpTooltip',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  computed: {
    content () {
      return helpMap[this.name]
    },
  },
}
</script>

<style lang="less">
.help-tooltip-content-wrap {
  > h4 {
    color: #fff;
    font-size: 14px;
  }
  > p {
    font-size: 12px;
  }
}
</style>
