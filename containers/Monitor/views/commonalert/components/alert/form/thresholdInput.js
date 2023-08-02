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
          self.emitValue(e.target.value)
        },
      },
    }, childs)
  },
  data () {
    let threshold = { value: this.value, option: undefined }
    const options = THRESHOLD_OPTIONS[this.unit]
    if (options) {
      let option = options[0]
      const ops = options.filter((o) => { return this.value / o.base > 1 })
      if (ops && ops.length > 0) {
        option = ops[ops.length - 1]
      }
      threshold = { value: this.value / option.base, option: option }
    }
    return {
      options,
      threshold,
    }
  },
  watch: {
    unit (val) {
      let targetUnit = val
      this.options = THRESHOLD_OPTIONS[val]
      if (!this.threshold.option && this.options) {
        let op = this.options[0]
        if (this.value) {
          const ops = this.options.filter((o) => { return this.value / o.base > 1 })
          op = ops.length > 0 ? ops[ops.length - 1] : op
          this.threshold.value = this.value / op.base
        }
        targetUnit = op.value
      }

      this.handleUnitChange(targetUnit)
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
      this.threshold.value = v
      this._emitValue()
    },
    renderUnit (h) {
      const unit = this.unit
      const option = this.threshold.option
      if (!this.unit || this.unit === 'RMB') {
        return ''
      }
      if (this.options) {
        return <a-select slot="addonAfter" default-value={ option.value || unit || '' } style="width: 80px" onChange={ this.handleUnitChange } disabled={ this.disabled }>
          {
            this.options.map((item) => {
              return <a-select-option value={ item.value } key={ item.key }> { item.label } </a-select-option>
            })
          }
        </a-select>
      } else {
        return <span slot="addonAfter">{ unit }</span>
      }
    },
  },
}
