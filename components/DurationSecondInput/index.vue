<template>
  <a-input :value="num" type="number" @change="inputChange">
    <a-select slot="addonAfter" :value="time" @change="change" style="min-width: 70px;">
      <a-select-option v-for="item in durationOptions" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
    </a-select>
  </a-input>
</template>

<script>
import { formatSeconds } from '@/utils/utils'

// 此组件以秒为传递单位，输入输出都为秒（Number）
export default {
  name: 'DurationSecondInput',
  props: {
    value: {
      type: Number,
      required: true,
    },
    durationOptions: {
      type: Array,
      default: () => [
        { label: '秒', key: 'seconds' },
        { label: '分', key: 'minutes' },
        { label: '小时', key: 'hours' },
        { label: '天', key: 'days' },
        { label: '月', key: 'months' },
        { label: '年', key: 'years' },
      ],
    },
    min: {
      type: Number,
      default: 1,
    },
  },
  data () {
    // 将传入的秒进行和控件单位转换，显示为最大值（如：传入3600，应该显示60分）
    const f = formatSeconds(this.value)
    let ret = f.arr[0]
    for (let i = 0, len = f.arr.length; i < len; i++) {
      const value = f.arr[i]
      if (value[0] > 0) {
        ret = value
        break
      }
    }
    return {
      num: ret[0],
      time: ret[1],
    }
  },
  methods: {
    change (val) {
      this.time = val
      this.emit()
    },
    inputChange (e) {
      const val = +e.target.value
      const v = val < this.min ? this.min : val
      this.num = v || this.min
      this.emit()
    },
    emit () {
      let sec = this.$moment.duration(+this.num, this.time)
      sec = sec.asSeconds()
      this.$emit('change', sec)
      this.$emit('input', sec)
    },
  },
}
</script>
