const THRESHOLD_OPTIONS = {
  Bps: [
    { value: 'Bps', key: 'byte/s', label: 'byte/s', base: 1 },
    { value: 'KB/s', key: 'KB/s', label: 'KB/s', base: 1024 },
    { value: 'MB/s', key: 'MB/s', label: 'MB/s', base: 1024 * 1024 },
    { value: 'GB/s', key: 'GB/s', label: 'GB/s', base: 1024 * 1024 * 1024 },
  ],
  bps: [
    { value: 'bps', key: 'bit/s', label: 'bit/s', base: 1 },
    { value: 'Kb/s', key: 'Kb/s', label: 'Kb/s', base: 1000 },
    { value: 'Mb/s', key: 'Mb/s', label: 'Mb/s', base: 1000 * 1000 },
    { value: 'Gb/s', key: 'Gb/s', label: 'Gb/s', base: 1000 * 1000 * 1000 },
  ],
  byte: [
    { value: 'byte', key: 'byte', label: 'byte', base: 1 },
    { value: 'KB', key: 'KB', label: 'KB', base: 1024 },
    { value: 'MB', key: 'MB', label: 'MB', base: 1024 * 1024 },
    { value: 'GB', key: 'GB', label: 'GB', base: 1024 * 1024 * 1024 },
  ],
}

export default {
  name: 'thresholdInput',
  props: {
    value: {
      type: Number,
    },
    unit: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  render (h, context) {
    const self = this
    const childs = []
    const addonAfter = this.renderUnit(h)
    if (addonAfter) childs.push(addonAfter)
    return h('a-input', {
      props: {
        value: self.threshold.value,
        disabled: self.disabled,
      },
      on: {
        input: function (e) {
          self.emitValue(e.target.value)
        },
        blur: function (e) {
          const inputValue = e.target.value
          const currentValue = self.threshold.value
          // 转换为数字进行比较，避免字符串比较问题
          const newNum = inputValue === '' ? '' : Number(inputValue)
          const currentNum = currentValue === '' ? '' : Number(currentValue)
          // 只有当值真正改变时才 emit
          if (newNum !== currentNum && !(isNaN(newNum) && isNaN(currentNum))) {
            self.emitValue(inputValue)
          }
        },
      },
    }, childs)
  },
  data () {
    let threshold = { value: this.value, option: undefined }
    const options = THRESHOLD_OPTIONS[this.unit]
    if (options && this.value != null && this.value !== '') {
      let option = options[0]
      // 找到最大的合适单位（value / base >= 1）
      const ops = options.filter((o) => {
        return this.value != null && this.value / o.base >= 1
      })
      if (ops && ops.length > 0) {
        option = ops[ops.length - 1]
      }
      threshold = { value: this.value / option.base, option: option }
    } else if (options) {
      // 如果没有值，使用第一个单位
      threshold = { value: this.value || '', option: options[0] }
    }
    return {
      options,
      threshold,
    }
  },
  mounted () {
    // 确保初始化时单位选择正确
    if (this.options && this.options.length > 0) {
      if (this.value != null && this.value !== '') {
        // 重新计算最合适的单位
        const ops = this.options.filter((o) => {
          return this.value / o.base >= 1
        })
        let selectedOption
        if (ops && ops.length > 0) {
          selectedOption = ops[ops.length - 1]
        } else {
          selectedOption = this.options[0]
        }
        // 更新单位和显示值
        this.threshold.option = selectedOption
        this.threshold.value = this.value / selectedOption.base
      } else if (!this.threshold.option) {
        // 如果没有值，使用第一个单位
        this.threshold.option = this.options[0]
      }
    }
  },
  watch: {
    unit (val) {
      this.options = THRESHOLD_OPTIONS[val]
      if (this.options && this.options.length > 0) {
        // 总是重新选择最合适的单位
        let targetUnit = this.options[0].value
        // 如果有值，找到合适的单位
        if (this.value != null && this.value !== '') {
          const ops = this.options.filter((o) => {
            return this.value / o.base >= 1
          })
          if (ops && ops.length > 0) {
            targetUnit = ops[ops.length - 1].value
          }
        }
        const selectedOption = this.options.find(o => o.value === targetUnit) || this.options[0]
        if (this.value != null && this.value !== '') {
          this.threshold.value = this.value / selectedOption.base
        } else {
          this.threshold.value = this.value || ''
        }
        this.threshold.option = selectedOption
      }
    },
    value (v) {
      // 如果外部传入的是原始值（已乘以base），需要转换为显示值
      if (v != null && v !== '') {
        if (this.options && this.options.length > 0) {
          // 总是重新选择最合适的单位
          let option = this.options[0]
          const ops = this.options.filter((o) => {
            return v / o.base >= 1
          })
          if (ops && ops.length > 0) {
            option = ops[ops.length - 1]
          }
          this.threshold.option = option
          this.threshold.value = v / option.base
        } else {
          this.threshold.value = v
        }
      } else {
        this.threshold.value = v
      }
    },
  },
  methods: {
    handleUnitChange (v) {
      if (this.options) {
        const os = this.options.filter((o) => { return o.value === v })
        this.threshold.option = os[0]
      } else {
        this.threshold.option = undefined
      }
      this._emitValue()
    },
    _emitValue () {
      let v = this.threshold.value
      if (v) {
        v = this.threshold.option ? this.threshold.option.base * v : v
      }
      this.$emit('change', v)
    },
    emitValue (v) {
      // 将字符串转换为数字
      const numValue = v === '' ? '' : Number(v)
      if (isNaN(numValue) && numValue !== '') {
        return // 无效输入，不处理
      }
      this.threshold.value = numValue
      this._emitValue()
    },
    renderUnit (h) {
      const unit = this.unit
      const option = this.threshold.option
      if (!this.unit || this.unit === 'RMB') {
        return ''
      }
      if (this.options) {
        const selectValue = option ? option.value : (unit || '')
        return <a-select slot="addonAfter" value={selectValue} style="width: 80px" onChange={this.handleUnitChange} disabled={this.disabled}>
          {
            this.options.map((item) => {
              return <a-select-option value={item.value} key={item.key}> {item.label} </a-select-option>
            })
          }
        </a-select>
      } else if (unit !== 'NULL') {
        return <span slot="addonAfter">{unit}</span>
      } else {
        return ''
      }
    },
  },
}
