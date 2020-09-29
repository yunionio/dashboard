import i18n from '@/locales'
export default {
  name: 'ClearingRadios',
  inject: ['form'],
  props: {
    billing_type: {
      type: String,
      default: 'postpaid',
    },
    duration: {
      type: String,
      default: '1M',
    },
    labelCol: {
      type: Object,
      default: () => {
        return {
          span: 24,
        }
      },
    },
    wrapperCol: {
      type: Object,
      default: () => {
        return {
          span: 24,
        }
      },
    },
  },
  computed: {
    FC () {
      if (this.form && this.form.fc) {
        return this.form.fc
      }
      return this.$form.createForm(this)
    },
    formItemLayout () {
      return {
        labelCol: this.labelCol,
        wrapperCol: this.wrapperCol,
      }
    },
  },
  render (h) {
    const { getFieldDecorator, getFieldValue } = this.FC
    const isPrepaid = getFieldValue('billing_type') === 'prepaid'
    const RenderDuration = isPrepaid ? (
      <div>
        {getFieldDecorator('duration', {
          initialValue: this.duration,
        })(
          <a-radio-group>
            {Object.keys(this.$t('buyDurations')).map(k => {
              return (
                <a-radio-button key={k} value={k}>
                  {this.$t('buyDurations')[k]}
                </a-radio-button>
              )
            })}
          </a-radio-group>,
        )}
      </div>
    ) : null
    return (
      <div>
        <a-form-item labelCol={this.labelCol} wrapperCol={this.wrapperCol} label={i18n.t('table.title.bill_type')}>
          {getFieldDecorator('billing_type', {
            initialValue: this.billing_type,
          })(
            <a-radio-group>
              {Object.keys(this.$t('billingType')).map(k => {
                return (
                  <a-radio-button key={k} value={k}>
                    {this.$t('billingType')[k]}
                  </a-radio-button>
                )
              })}
            </a-radio-group>,
          )}
          {RenderDuration}
        </a-form-item>
      </div>
    )
  },
}
