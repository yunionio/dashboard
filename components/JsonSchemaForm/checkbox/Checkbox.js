import FormMixin from '../mixins'

const Checkbox = {
  name: 'JCheckbox',
  mixins: [FormMixin],
  model: {
    prop: 'value',
    event: 'change.value',
  },
  props: {
    value: Boolean,
  },
  render (h) {
    const { definition, value } = this

    return (
      <a-checkbox { ...this.$props } onChange={ this.onChange } checked={ value }>{ definition.formItem.label }</a-checkbox>
    )
  },
  methods: {
    onChange (e) {
      this.$emit('change', e.target.checked)
    },
  },
}

export default Checkbox
