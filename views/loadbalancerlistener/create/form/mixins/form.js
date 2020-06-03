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
  },
  data () {
    return {
      loading: false,
      lbDetail: {},
      allFd: {
        loadbalancer: this.$route.params.id,
      },
      listenerData: {},
    }
  },
  computed: {
    currentComponent () {
      return this.step.steps[this.step.currentStep] ? this.step.steps[this.step.currentStep].component : ''
    },
  },
  created () {
    this.fetchdata()
  },
  methods: {
    async fetchdata () {
      this.loading = true
      const requests = [this.fetchLbDetail()]
      if (this.isUpdate) {
        requests.push(this.fetchLbListener())
      }
      try {
        await Promise.all(requests)
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
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
    async fetchLbListener () {
      try {
        const { listener } = this.$route.query
        const { data } = await new this.$Manager('loadbalancerlisteners').get({ id: listener })
        this.listenerData = data
      } catch (error) {
        throw error
      }
    },
    async fetchLbDetail () {
      try {
        const { id } = this.$route.params
        const { data } = await new this.$Manager('loadbalancers').get({ id })
        this.lbDetail = data
        return data
      } catch (error) {
        throw error
      }
    },
  },
}
