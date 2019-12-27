<template>
  <a-form-item label="录入方式">
    <a-radio-group v-decorator="decorators.mode">
      <template v-for="(item, key) of modes">
        <a-radio-button :value="key" :key="key">{{ item }}</a-radio-button>
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
  computed: {
    modes () {
      const ret = this.$t('physicalmachineAddModes')
      if (this.ignoreMode) {
        const ignoreMode = R.is(String, this.ignoreMode) ? [this.ignoreMode] : this.ignoreMode
        for (let i = 0, len = ignoreMode.length; i < len; i++) {
          delete ret[ignoreMode[i]]
        }
      }
      return ret
    },
  },
}
</script>
