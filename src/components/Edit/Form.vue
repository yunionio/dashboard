<template>
  <a-form
    :form="form"
    :style="{ width: `${width}px` }"
    @submit="handleSubmit">
    <a-form-item :label="label" v-bind="formLayout">
      <a-input v-decorator="decorators.input" :placeholder="placeholder" allowClear />
    </a-form-item>
    <div class="d-flex flex-row-reverse">
      <a-button class="ml-3" type="primary" html-type="submit">确定</a-button>
      <a-button @click="cancel">取消</a-button>
    </div>
  </a-form>
</template>

<script>
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
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      }),
    },
    label: {
      type: String,
      default: '名称',
    },
    defaultValue: {
      type: String,
    },
    formRules: {
      type: Array,
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
              { required: true, message: `请输入${this.label}` },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    placeholder () {
      if (this.label) return `请输入${this.label}`
      return '请输入'
    },
  },
  methods: {
    cancel () {
      this.$emit('cancel')
    },
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
          this.$emit('submit', values)
        }
      })
    },
  },
}
</script>
