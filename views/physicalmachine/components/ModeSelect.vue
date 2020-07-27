<template>
  <a-form-item :label="$t('compute.text_827')">
    <a-radio-group v-decorator="decorators.mode">
      <template v-for="(item, key) of modes">
        <a-radio-button :value="key" :key="key" v-if="!ignores.includes(key)">{{ item }}</a-radio-button>
      </template>
    </a-radio-group>
  </a-form-item>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'ModeSelect',
  props: {
    ignoreMode: [String, Array],
    decorators: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      modes: this.$t('physicalmachineAddModes'),
    }
  },
  computed: {
    ignores () {
      return R.is(String, this.ignoreMode) ? [this.ignoreMode] : (this.ignoreMode || [])
    },
  },
}
</script>
