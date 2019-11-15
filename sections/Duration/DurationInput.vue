<template>
  <a-input-group compact>
    <a-input class="w-25" :value="num" @change="inputChange" />
    <a-select :value="time" @change="change">
      <a-select-option v-for="item in durationOptions" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
    </a-select>
  </a-input-group>
</template>

<script>
export default {
  name: 'DurationInput',
  props: {
    value: { // e.g. 1h、1d、1m、1d
      type: String,
      required: true,
    },
  },
  data () {
    const num = this.value.match(/^\d+/)[0]
    const time = this.value.match(/[a-z]+$/) ? this.value.match(/[a-z]+$/)[0] : 'h'
    return {
      num,
      time,
      durationOptions: [
        { label: '小时', key: 'h' },
        { label: '天', key: 'd' },
        { label: '月', key: 'm' },
        { label: '年', key: 'y' },
      ],
    }
  },
  watch: {
    value () {
      const num = this.value.match(/^\d+/)[0]
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
      this.num = val.target.value
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
