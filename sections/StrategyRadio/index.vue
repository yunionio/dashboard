<template>
  <a-form-item class="mb-0">
    <a-radio-group v-decorator="decorator">
      <a-radio-button
        v-for="item in opts"
        :value="item.key"
        :key="item.key">{{ item.label }}</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
// description：偏好设置 组件
import { STRATEGY_OPT } from '@Cloudenv/constants/sched'

export default {
  name: 'SrategyRadio',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      opts: STRATEGY_OPT,
    }
  },
}
</script>
