<template>
  <div>
    <a-form-item class="mb-0">
      <a-switch v-decorator="decorators.durationEnable" @change="change" />
    </a-form-item>
    <a-form-item v-if="showDuration">
      <duration-input v-decorator="decorators.duration" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import DurationInput from './DurationInput'

export default {
  name: 'Duration',
  components: {
    DurationInput,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => !R.isNil(val.durationEnable) && !R.isNil(val.duration),
    },
  },
  data () {
    return {
      showDuration: this.decorators.durationEnable[1].initialValue,
    }
  },
  methods: {
    change (val) {
      this.showDuration = val
    },
  },
}
</script>
