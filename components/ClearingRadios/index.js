import { BILL_TYPES_MAP, BUY_DURATIONS_OPTIONS } from './constants'
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
            {Object.keys(BUY_DURATIONS_OPTIONS).map(k => {
              return (
                <a-radio-button key={k} value={k}>
                  {BUY_DURATIONS_OPTIONS[k]}
                </a-radio-button>
              )
            })}
          </a-radio-group>
        )}
      </div>
    ) : null
    return (
      <div>
        <a-form-item labelCol={this.labelCol} wrapperCol={this.wrapperCol} label="计费方式">
          {getFieldDecorator('billing_type', {
            initialValue: this.billing_type,
          })(
            <a-radio-group>
              {Object.keys(BILL_TYPES_MAP).map(k => {
                return (
                  <a-radio-button key={k} value={k}>
                    {BILL_TYPES_MAP[k]}
                  </a-radio-button>
                )
              })}
            </a-radio-group>
          )}
          {RenderDuration}
        </a-form-item>
      </div>
    )
  },
}
