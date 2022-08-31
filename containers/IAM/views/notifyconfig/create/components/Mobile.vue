<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout"
    hideRequiredMark>
    <a-form-item :label="$t('notify.configs.sms_driver')">
      <a-radio-group v-decorator="decorators.sms_driver">
        <a-radio-button
          v-for="item in driverOpts"
          :value="item.key"
          :key="item.key">
          {{ item.label }}
        </a-radio-button>
      </a-radio-group>
    </a-form-item>
    <component
      ref="typeRef"
      :is="form.fd.sms_driver"
      :form="form"
      :form-item-layout="formItemLayout" />
  </a-form>
</template>

<script>
import smsaliyun from './smsaliyun'
import smshuawei from './smshuawei'

export default {
  name: 'MobileConfig',
  components: {
    smsaliyun,
    smshuawei,
  },
  props: {
    formItemLayout: {
      required: true,
      type: Object,
    },
    offsetWrapperCol: {
      required: true,
      type: Object,
    },
    loading: Boolean,
    docUrl: String,
  },
  data () {
    return {
      submiting: false,
      testLoding: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          sms_driver: 'smsaliyun',
        },
      },
      driverOpts: [
        { label: this.$t('providers.aliyun'), key: 'smsaliyun' },
        { label: this.$t('providers.huawei'), key: 'smshuawei' },
      ],
      decorators: {
        sms_driver: [
          'sms_driver',
          {
            initialValue: 'smsaliyun',
          },
        ],
      },
    }
  },
  computed: {
    is_aliyun () {
      return this.form.fd.sms_driver === 'smsaliyun'
    },
  },
}
</script>
