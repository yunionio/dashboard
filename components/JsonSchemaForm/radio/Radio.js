import FormMixin from '../mixins'

const Radio = {
  name: 'JRadio',
  mixins: [FormMixin],
  model: {
    prop: 'value',
    event: 'change.value',
  },
  props: {
    value: [Boolean, String],
  },
  render (h) {
    const { definition, value } = this
    const { options } = definition.input || {}

    if (options && options.length) {
      return (
        <a-radio-group options={ options } onChange={ this.onChange } value={ value } />
      )
    } else {
      return (
        <a-radio { ...this.$props } onChange={ this.onChange } checked={ value }>{ definition.formItem.label }</a-radio>
      )
    }
  },
  methods: {
    onChange (e) {
      const target = e.target
      const value = target.value || target.checked
      // this.stateValue = value
      this.$emit('change', value)
    },
  },
}

export default Radio
