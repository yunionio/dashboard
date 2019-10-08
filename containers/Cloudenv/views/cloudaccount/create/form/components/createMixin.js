export default {
  props: {
    provider: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      formLayout: {
        labelCol: { span: 3 },
        wrapperCol: { span: 10 },
      },
    }
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) {
            reject(err)
          } else {
            console.log('Received values of form: ', values)
            resolve(values)
          }
        })
      })
    },
  },
}
