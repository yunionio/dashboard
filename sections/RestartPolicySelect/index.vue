<template>
  <a-form-item>
    <base-select
      v-decorator="decorator"
      :options="options" />
  </a-form-item>
</template>

<script>
import * as R from 'ramda'
import { RESTART_POLICY_OPTS } from '@K8S/constants/index.js'

export default {
  name: 'K8SrestartPolicySelect',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      required: true,
      validator: type => R.is(Array, RESTART_POLICY_OPTS[type]),
    },
  },
  data () {
    return {
      options: RESTART_POLICY_OPTS[this.type],
    }
  },
}
</script>
