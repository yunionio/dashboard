<template>
  <div v-loading="true">
    <page-header :title="$t('network.text_465', [isUpdate ? $t('network.text_130') : $t('network.text_26')])" />
    <page-body needMarginBottom>
      <steps v-show="!isLbRedirected" v-model="step" />
      <components :is="component" :step="step" ref="formRef" :isUpdate="isUpdate" />
    </page-body>
    <page-footer>
      <template v-slot:right>
        <template v-if="isLbRedirected">
          <a-button type="primary" class="mr-2" @click="isUpdate ? update() : validateForm() " :loading="loading">{{$t('network.text_30')}}</a-button>
        </template>
        <template v-else>
          <a-button @click="prev" v-if="!isFirstStep" class="mr-2">{{$t('network.text_466')}}</a-button>
          <a-button :type="isUpdate ? '' : 'primary'" class="mr-2" @click="next" :loading="isUpdate ? false : loading" v-if="isUpdate ? !isLastStep : true">{{ nextStepTitle }}</a-button>
          <a-button :type="isUpdate ? 'primary' : ''" class="mr-2" v-if="isUpdate" @click="update" :loading="loading">{{$t('network.text_467')}}</a-button>
        </template>
        <a-button @click="cancel">{{$t('network.text_31')}}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Onecloud from './form/onecloud'
import Aliyun from './form/aliyun'
import Qcloud from './form/qcloud'
import Huawei from './form/huawei'
import AwsApplication from './form/aws-application'
import AwsNetwork from './form/aws-network'
import StepMixin from '@/mixins/step'
import { filterObj } from '@/utils/utils'

const getOnOff = bool => bool ? 'on' : 'off'

export default {
  name: 'LbCreateIndex',
  components: {
    Onecloud,
    Aliyun,
    Qcloud,
    Huawei,
    AwsApplication,
    AwsNetwork,
  },
  mixins: [StepMixin],
  data () {
    const isUpdate = this.$route.path.includes('listener-update')
    let component = this.$route.query.type.toLowerCase()
    if (component === 'aws') {
      component += `-${this.$route.query.spec}`
    }
    return {
      component,
      isUpdate,
      loading: false,
      step: {
        steps: [
          { title: this.$t('network.text_468'), component: 'Protocol' },
          { title: this.$t('network.text_139'), component: 'Backendgroup' },
          { title: this.$t('network.text_469'), component: 'Healthcheck' },
        ],
        currentStep: 0,
      },
    }
  },
  computed: {
    ...mapState('common', {
      isLbRedirected: state => {
        return !!state.lbRedirected.isLbRedirected
      },
    }),
  },
  methods: {
    getParams (data) {
      const params = {
        ...data,
        acl_status: getOnOff(data.acl_status),
        health_check: getOnOff(data.health_check),
        sticky_session: getOnOff(data.sticky_session),
        redirect: data.redirect ? 'raw' : 'off',
      }
      if (params.health_check_http_code) {
        params.health_check_http_code = params.health_check_http_code.join(',')
      }
      return params
    },
    async validateForm () { // 配合 StepMixin 进行下一步或者提交表单时的校验
      try {
        await this.$refs.formRef.validateForm()
        if (this.isLastStep || this.isLbRedirected) {
          const params = this.getParams(this.$refs.formRef.allFd)
          this.create(params)
        }
      } catch (error) {
        throw error
      }
    },
    next () {
      const { currentStep } = this.step
      const next = currentStep + 1
      this.setStep(next)
    },
    async prev () {
      const { currentStep } = this.step
      const prev = currentStep - 1
      await this.$refs.formRef.validateForm(true)
      this.setStep(prev)
    },
    async update () {
      this.loading = true
      try {
        await this.$refs.formRef.validateForm()
        let data = this.getParams(this.$refs.formRef.allFd)
        if (data.sticky_session === 'off') {
          data = filterObj((val, k) => !k.startsWith('sticky_session_'), data)
        }
        if (data.acl_status === 'off') {
          data = filterObj((val, k) => {
            if (k.startsWith('acl')) {
              return k === 'acl_status'
            }
            return true
          }, data)
        }
        if (data.health_check === 'off') {
          data = filterObj((val, k) => !k.startsWith('health_check_'), data)
        }
        await new this.$Manager('loadbalancerlisteners').update({ id: this.$route.query.listener, data })
        this.loading = false
        this.cancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    async create (data) {
      this.loading = true
      try {
        await new this.$Manager('loadbalancerlisteners').create({ data })
        this.$message.success(this.$t('network.text_290'))
        this.loading = false
        this.cancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/lb')
    },
  },
}
</script>
