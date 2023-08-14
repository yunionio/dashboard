<template>
  <a-form
    :form="form"
    :style="{ width: `${width}px` }">
    <a-form-item :label="label" v-bind="formLayout">
      <a-input class="w-100" v-decorator="decorators.input" :placeholder="placeholder" allowClear />
    </a-form-item>
    <div class="text-right">
      <a-button type="primary" html-type="submit" @click="handleSubmit">{{ okText }}</a-button>
      <a-button class="ml-3" @click="cancel">{{ cancelText }}</a-button>
    </div>
  </a-form>
</template>

<script>
import * as R from 'ramda'
import i18n from '@/locales'

export default {
  name: 'EditForm',
  props: {
    width: {
      type: Number,
      default: 400,
    },
    formLayout: {
      type: Object,
      default: () => ({
        wrapperCol: { span: 19 },
        labelCol: { span: 5 },
      }),
    },
    label: {
      type: String,
      default: i18n.t('common.name'),
    },
    defaultValue: {
      type: String,
    },
    formRules: {
      type: Array,
    },
    okText: {
      type: String,
      default: i18n.t('common.ok'),
    },
    cancelText: {
      type: String,
      default: i18n.t('common.cancel'),
    },
  },
  data () {
    return {
      form: this.$form.createForm(this),
      decorators: {
        input: [
          'input',
          {
            initialValue: this.defaultValue,
            validateFirst: true,
            rules: this.formRules || [
              { required: true, message: `${this.$t('common.placeholder')} ${this.label.toLowerCase()}` },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    placeholder () {
      if (this.label) return `${this.$t('common.placeholder')} ${this.label.toLowerCase()}`
      return this.$t('common.placeholder')
    },
  },
  methods: {
    cancel () {
      this.$emit('cancel')
    },
    handleSubmit (e) {
      console.log('submit')
      this.form.validateFields((err, values) => {
        if (!err) {
          const trimValue = R.map(value => {
            if (R.is(String, value)) {
              return value.trim()
            }
            return value
          }, values)
          console.log('emit submit', trimValue)
          this.$emit('submit', trimValue)
        } else {
          console.error(err)
        }
      })
    },
  },
}
</script>
