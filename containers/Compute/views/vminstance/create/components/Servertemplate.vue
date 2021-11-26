<template>
  <div>
    <a-divider orientation="left">{{$t('compute.text_94')}}</a-divider>
    <slot />
    <a-form-item :label="$t('compute.text_1140')" help="" :extra="$t('validator.resourceName')">
      <a-input v-decorator="decorators.servertemplate_name" :placeholder="$t('compute.text_220')" />
    </a-form-item>
    <a-form-item :label="$t('common.description')">
      <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
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
  },
}
</script>
