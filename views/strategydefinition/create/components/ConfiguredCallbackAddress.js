import FormItem from './FormItem'
import i18n from '@/locales'

export default {
  name: 'StrategyConfiguredCallbackAddress',
  components: {
    FormItem,
  },
  inject: ['form'],
  props: {
    labelCol: {
      type: Object,
      default: () => {
        return {
          span: 3,
        }
      },
    },
    wrapperCol: {
      type: Object,
      default: () => {
        return {
          span: 21,
        }
      },
    },
    options: {
      type: Array,
      default: () => [],
    },
    presentPolicies: {
      type: Object,
      default: () => {},
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
  },
  data () {
    return {}
  },
  render (h) {
    return (
      <a-form-item labelCol={this.labelCol} wrapperCol={this.wrapperCol} label={i18n.t('cloudenv.text_547')}>
        {
          this.options.map(item => {
            return (<FormItem labelCol={ this.labelCol } wrapperCol={ this.wrapperCol } option={ item } presentPolicies={ this.presentPolicies } disabled= { this.disabled } />)
          })
        }
      </a-form-item>
    )
  },
}
