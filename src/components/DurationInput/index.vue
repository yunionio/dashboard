<template>
  <a-input-group compact>
    <a-input class="w-25" style="max-width: 200px;" :value="num" type="number" @change="inputChange" />
    <a-select :value="time" @change="change">
      <a-select-option v-for="item in durationOptions" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
    </a-select>
  </a-input-group>
</template>

<script>
import * as R from 'ramda'
import i18n from '@/locales'

export default {
  name: 'DurationInput',
  props: {
    value: { // e.g. 1h、1d、1m、1d
      type: String,
      required: true,
    },
    durationOptions: {
      type: Array,
      default: () => [
        { label: i18n.t('common_11'), key: 'h' },
        { label: i18n.t('common_12'), key: 'd' },
        { label: i18n.t('common_13'), key: 'm' },
        { label: i18n.t('common_14'), key: 'y' },
      ],
    },
  },
  data () {
    const numMatch = this.value.match(/^\d+/)
    const num = R.is(Array, numMatch) ? numMatch[0] : undefined
    const time = this.value.match(/[a-z]+$/) ? this.value.match(/[a-z]+$/)[0] : 'h'
    return {
      num,
      time,
    }
  },
  watch: {
    value () {
      const numMatch = this.value.match(/^\d+/)
      const num = R.is(Array, numMatch) ? numMatch[0] : undefined
      const time = this.value.match(/[a-z]+$/)[0]
      this.num = num
      this.time = time
    },
  },
  methods: {
    change (val) {
      this.time = val
      this.emit()
    },
    inputChange (val) {
      const v = val.target.value === '0' ? 1 : val.target.value
      this.num = v || 1
      this.emit()
    },
    emit () {
      this.$emit('change', this.num + this.time)
    },
  },
}
</script>

<style>

</style>
