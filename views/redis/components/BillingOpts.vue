<template>
  <div>
    <a-form-item :label="$t('db.text_54')" v-bind="formItemLayout">
      <a-radio-group v-decorator="decorators['billing_type']">
        <a-radio-button
          :key="key"
          :value="key"
          v-for="key in Object.keys(BILL_TYPES_MAP)">{{BILL_TYPES_MAP[key].label}}</a-radio-button>
      </a-radio-group>
      <div v-if="getFieldValue('billing_type') === 'prepaid'">
        <a-radio-group v-decorator="decorators['duration']">
            <a-radio-button
              :key="item.value"
              :value="item.value"
              v-for="item in BUY_DURATIONS_OPTIONS">
              {{item.label}}</a-radio-button>
        </a-radio-group>
      </div>
    </a-form-item>
  </div>
</template>
<script>
import { BILL_TYPES_MAP, BUY_DURATIONS_OPTIONS } from '../constants/index.js'
import { CreateServerForm } from '@Compute/constants'

const decorators = {
  billing_type: [
    'billing_type',
    {
      initialValue: 'postpaid',
    },
  ],
  duration: [
    'duration',
    {
      initialValue: '1M',
    },
  ],
}

export default {
  inject: ['form'],
  props: {
    decorators: {
      type: Object,
      default: () => {
        return decorators
      },
    },
  },
  data () {
    return {
      BILL_TYPES_MAP,
      BUY_DURATIONS_OPTIONS,
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
    }
  },
  computed: {
    FC () {
      if (this.form && this.form.fc) {
        return this.form.fc
      }
      return {}
    },
    getFieldValue () {
      if (this.FC && this.FC.getFieldValue) {
        return this.FC.getFieldValue
      }
      return () => null
    },
  },
}
</script>
