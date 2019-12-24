import * as R from 'ramda'

/**
 * step mixin 仅用来与step组件组合使用
 * 如果在下一步的跳转过程中需要表单校验的话，需要提供表单校验的方法 validateForm
 */
export default {
  computed: {
    isFirstStep () {
      return this.step.currentStep === 0
    },
    isLastStep () {
      return R.equals(this.step.steps.length - 1, this.step.currentStep)
    },
    nextStepTitle () {
      if (this.isLastStep) return '确定'
      const nextIndex = this.step.currentStep + 1
      if (nextIndex >= this.step.steps.length) return this.step.steps[this.step.steps.length - 1].title
      return `下一步: ${this.step.steps[nextIndex].title}`
    },
  },
  methods: {
    setStep (nextStep) {
      const { currentStep } = this.step
      if (nextStep > currentStep) { // 下一步要进行表单验证
        if (R.equals(nextStep, currentStep + 1)) { // 不允许跨层级
          if (this.validateForm) {
            this.validateForm().then(() => {
              if (this.isLastStep) return
              this.step.currentStep = nextStep
            })
          } else {
            if (this.isLastStep) return
            this.step.currentStep = nextStep
          }
        } else {
          if (this.isLastStep) return
          const nextIndex = this.step.steps.findIndex(step => R.equals(step, this.step.currentStep)) + 1
          const { title } = this.step.steps[nextIndex]
          this.$message.warning(`请您先进行 下一步${title ? '：' + title : ''} 的操作`)
        }
      } else { // 上一步不需要表单验证
        this.step.currentStep = nextStep
      }
    },
  },
}
