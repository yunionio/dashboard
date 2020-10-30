import i18n from '@/locales'
export default {
  name: 'FormItem',
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
    option: {
      type: Object,
      required: true,
      validator: val => val.label && val.value,
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
    return {
      isShowText: !this.presentPolicies[this.option.value],
    }
  },
  methods: {
    handleShowFormItem () {
      this.isShowText = false
      this.render && this.render()
    },
    handleHiddenFormItem () {
      this.isShowText = true
      this.render && this.render()
    },
    renderFormItem () {
      const { getFieldDecorator } = this.form.fc
      return (
        <a-row gutter={ 8 }>
          <a-col span={ 12 } >
            {getFieldDecorator(this.option.value, {
              initialValue: this.presentPolicies[this.option.value],
              rules: [
                { required: true, message: i18n.t('cloudenv.text_548') },
              ],
            })(
              <a-input placeholder={i18n.t('cloudenv.text_548')} disabled={ this.disabled } />,
            )}
          </a-col>
          {
            !this.disabled
              ? (<a-col span={ 12 }>
                <a-button type="link" onClick={ this.handleHiddenFormItem }>
                  取消
                </a-button>
              </a-col>)
              : null
          }
        </a-row>
      )
    },
  },
  render (h) {
    if (this.disabled && !this.presentPolicies[this.option.value]) return null
    return (
      <a-form-item labelCol={this.labelCol} wrapperCol={this.wrapperCol} label={ this.option.label }>
        {
          this.isShowText
            ? (<a-button type="link" onClick={ this.handleShowFormItem }>
              设置第三方回调地址
            </a-button>)
            : this.renderFormItem()
        }
      </a-form-item>
    )
  },
}
