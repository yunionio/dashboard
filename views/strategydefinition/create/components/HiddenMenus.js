import * as R from 'ramda'
import i18n from '@/locales'

export default {
  name: 'StrategyHiddenMenus',
  inject: ['form'],
  props: {
    decorators: {
      type: Object,
    },
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
  computed: {
    _presentPolicies () {
      if (!R.isEmpty(this.presentPolicies)) {
        return Object.keys(this.presentPolicies)
      }
      return []
    },
  },
  render (h) {
    const { getFieldDecorator } = this.form.fc
    return (
      <a-form-item labelCol={this.labelCol} wrapperCol={this.wrapperCol} label={i18n.t('cloudenv.text_509')}>
        {getFieldDecorator('hiddenMenus', {
          initialValue: this._presentPolicies,
          rules: [
            { required: true, message: i18n.t('cloudenv.text_549') },
          ],
        })(
          <a-checkbox-group options={ this.options } disabled={ this.disabled } />,
        )}
      </a-form-item>
    )
  },
}
