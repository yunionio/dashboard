<template>
  <div class="d-flex">
    <a-form-item
      class="mb-0 mr-1 w-50">
      <base-select
        class="w-100"
        v-decorator="decorators.schedtag"
        resource="schedtags"
        :need-params="true"
        :params="schedtagParams"
        :select-props="{ allowClear: true, placeholder: '请选择调度标签' }" />
    </a-form-item>
    <a-form-item class="mb-0 w-50">
      <base-select
        class="w-100"
        v-decorator="decorators.policy"
        :options="policyOpts"
        :select-props="{ allowClear: true, placeholder: '请选择调度策略' }" />
    </a-form-item>
  </div>
</template>

<script>
import { SCHEDTAG_POLICY_OPTIONS } from '@/constants'

export default {
  name: 'SchedtagPolicy',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.schedtag && val.policy,
    },
    schedtagParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      policyOpts: SCHEDTAG_POLICY_OPTIONS,
    }
  },
}
</script>
