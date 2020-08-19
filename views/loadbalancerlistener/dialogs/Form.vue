<template>
  <base-dialog :width="1000" @cancel="cancelDialog">
    <div slot="header">{{isUpdate ? $t('network.text_130') : $t('common_602')}}</div>
    <div slot="body">
      <steps v-show="!isLbRedirected" v-model="step" />
      <a-spin :spinning="spinning">
        <a-icon slot="indicator" type="loading" style="font-size: 24px" spin />
        <a-skeleton :loading="spinning" active :paragraph="{ rows: 6 }">
          <components
            :is="component"
            :step="step"
            ref="formRef"
            :listener-data="listenerData"
            :lb-detail="params.lbDetail"
            :isUpdate="isUpdate" />
        </a-skeleton>
      </a-spin>
    </div>
    <div slot="footer">
      <template v-if="isLbRedirected">
        <a-button type="primary" class="mr-2" @click="isUpdate ? update() : validateForm() " :loading="loading">{{$t('network.text_30')}}</a-button>
      </template>
      <template v-else>
        <a-button @click="prev" v-if="!isFirstStep" class="mr-2">{{$t('network.text_466')}}</a-button>
        <a-button type="primary" class="mr-2" @click="next" :loading="isUpdate ? false : loading" v-if="!isLastStep">{{ nextStepTitle }}</a-button>
        <a-button type="primary" class="mr-2" v-if="isLastStep" @click="isUpdate ? update() : validateForm()" :loading="loading">{{$t('network.text_30')}}</a-button>
      </template>
      <a-button @click="cancel">{{$t('network.text_31')}}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import Onecloud from '@Network/views/loadbalancerlistener/create/form/onecloud'
import Aliyun from '@Network/views/loadbalancerlistener/create/form/aliyun'
import Qcloud from '@Network/views/loadbalancerlistener/create/form/qcloud'
import Huawei from '@Network/views/loadbalancerlistener/create/form/huawei'
import AwsApplication from '@Network/views/loadbalancerlistener/create/form/aws-application'
import AwsNetwork from '@Network/views/loadbalancerlistener/create/form/aws-network'
import { filterObj } from '@/utils/utils'
import StepMixin from '@/mixins/step'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

const getOnOff = bool => bool ? 'on' : 'off'

export default {
  name: 'LbListenerFormDialog',
  components: {
    Onecloud,
    Aliyun,
    Qcloud,
    Huawei,
    AwsApplication,
    AwsNetwork,
  },
  mixins: [StepMixin, DialogMixin, WindowsMixin],
  data () {
    const { listenerData, lbDetail } = this.params
    const isUpdate = !!listenerData
    let component = lbDetail.brand.toLowerCase()
    if (component === 'aws') {
      component += `-${lbDetail.loadbalancer_spec}`
    }
    return {
      component,
      isUpdate,
      loading: false,
      spinning: false,
      listenerData: {},
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
    isLbRedirected () {
      return this.$store.getters.common.lbRedirected.isLbRedirected
    },
  },
  created () {
    if (this.isUpdate) {
      this.fetchLbListener()
      this.$store.dispatch('common/updateObject', {
        name: 'lbRedirected',
        data: {
          isLbRedirected: this.params.listenerData.redirect === 'raw',
        },
      })
    } else {
      this.$store.dispatch('common/updateObject', {
        name: 'lbRedirected',
        data: {
          isLbRedirected: false,
        },
      })
    }
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
    async fetchLbListener () {
      try {
        this.spinning = true
        const { data } = await new this.$Manager('loadbalancerlisteners').get({ id: this.params.listenerData.id })
        this.listenerData = data
      } catch (error) {
        throw error
      } finally {
        this.spinning = false
      }
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
        await this.params.onManager('update', {
          id: this.params.listenerData.id,
          managerArgs: {
            data,
          },
        })
        this.loading = false
        this.cancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    async create (data) {
      console.log(data)
      this.loading = true
      try {
        await this.params.onManager('create', {
          managerArgs: {
            data,
          },
        })
        this.$message.success(this.$t('network.text_290'))
        this.loading = false
        this.cancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.cancelDialog()
    },
  },
}
</script>
