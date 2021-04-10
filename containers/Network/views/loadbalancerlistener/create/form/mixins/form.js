export default {
  props: {
    step: {
      type: Object,
      required: true,
    },
    isUpdate: {
      type: Boolean,
      default: false,
    },
    listenerData: {
      type: Object,
    },
    lbDetail: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      loading: false,
      allFd: {
        loadbalancer: this.lbDetail.id,
      },
    }
  },
  computed: {
    currentComponent () {
      return this.step.steps[this.step.currentStep] ? this.step.steps[this.step.currentStep].component : ''
    },
  },
  methods: {
    async validateForm (isGoPrev) {
      try {
        const values = await this.$refs.formRef.form.fc.validateFields()
        this.allFd = { ...this.allFd, ...values }
        return values
      } catch (error) {
        if (isGoPrev) { // 如果是上一步的话，要同步数据并可以允许返回上一步，故这里不 throw error
          this.allFd = { ...this.allFd, ...error.values }
          console.error(error)
        } else {
          throw error
        }
      }
    },
  },
}
