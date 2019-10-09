<template>
  <div class="mb-2">
    <span>你所选的</span>
    <span class="ml-2 mr-2 primary-color">{{ count }}个{{ name }}</span>
    <span>将执行</span>
    <span class="ml-2 mr-2 warning-color">{{ action }}</span>
    <span>操作，你是否确认操作？</span>
  </div>
</template>

<script>
export default {
  name: 'DialogSelectedTips',
  props: {
    count: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      default: '实例',
    },
    action: {
      type: String,
      default: '修改属性',
    },
  },
}
</script>
