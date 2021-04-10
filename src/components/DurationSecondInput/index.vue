<template>
  <a-input :value="num" type="number" @change="inputChange">
    <a-select slot="addonAfter" :value="time" @change="change" style="min-width: 70px;">
      <a-select-option v-for="item in durationOptions" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
    </a-select>
  </a-input>
</template>

<script>
import i18n from '@/locales'
import { formatSeconds } from '@/utils/utils'

// 此组件以秒为传递单位，输入输出都为秒（Number）
// 定义一月为30天，一年为12个月，都为固定值计算
export default {
  name: 'DurationSecondInput',
  props: {
    value: {
      type: Number,
      required: true,
    },
    durationOptions: {
      type: Array,
      default: () => Object.keys(i18n.t('subDurations')).map(k => (
        {
          label: i18n.t('subDurations')[k],
          key: k,
        }
      )),
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
      let sec = this.num
      switch (this.time) {
        case 'minutes':
          sec = sec * 60
          break
        case 'hours':
          sec = sec * 60 * 60
          break
        case 'days':
          sec = sec * 60 * 60 * 24
          break
        case 'months':
          sec = sec * 60 * 60 * 24 * 30
          break
        case 'years':
          sec = sec * 60 * 60 * 24 * 30 * 12
          break
        default:
          break
      }
      this.$emit('change', sec)
      this.$emit('input', sec)
    },
  },
}
</script>
