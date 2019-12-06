<template>
  <div>
    <a-divider orientation="left">主机模板</a-divider>
    <a-form-item label="模板名称" v-bind="formItemLayout" help="" :extra="$t('validator.resourceName')">
      <a-input v-decorator="decorators.servertemplate_name" placeholder="请输入模板名称" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'

export default {
  props: {
    decorators: {
      type: Object,
      validator: val => R.is(Array, val.servertemplate_name),
    },
    formItemLayout: {
      type: Object,
      required: true,
    },
  },
}
</script>
