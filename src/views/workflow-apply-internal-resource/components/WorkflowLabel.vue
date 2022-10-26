<template>
  <div class="workflow-label">
    <span v-if="isRequired" class="required-text">*</span>
    <span>{{label}}</span>
  </div>
</template>

<script>
import { WORKFLOW_ITEM_MAP } from '../constants'
export default {
  name: 'WorkflowLabel',
  props: {
    field: String,
  },
  computed: {
    label () {
      return WORKFLOW_ITEM_MAP[this.field].label || ''
    },
    isRequired () {
      return WORKFLOW_ITEM_MAP[this.field].required || false
    },
  },
}
</script>

<style lang="less" scoped>
.workflow-label {
  height: 30px;
  line-height: 30px;
}
.required-text {
  display: inline-block;
  color: red;
  font-size: 18px;
  transform: translateY(4px);
  margin-right: 2px;
}
</style>
