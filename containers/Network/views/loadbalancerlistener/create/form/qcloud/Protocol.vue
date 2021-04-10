<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-divider orientation="left">{{$t('network.text_397')}}</a-divider>
    <a-form-item :label="$t('network.text_21')">
      <a-input :disabled="isUpdate" v-decorator="decorators.generate_name" :placeholder="$t('validator.resourceName')" />
      <name-repeated v-if="!isUpdate" v-slot:extra res="loadbalancerlisteners" :name="form.fd.generate_name" />
    </a-form-item>
    <a-form-item :label="$t('network.text_418')">
      <a-input :disabled="isUpdate" type="number" v-decorator="decorators.listener_port" :placeholder="$t('network.text_419')" />
    </a-form-item>
    <a-form-item :label="$t('network.text_420')" class="mb-0">
      <listener-types :decorators="decorators" :disabled="isUpdate" />
    </a-form-item>
    <a-form-item :label="$t('network.text_143')" v-if="form.fd.listener_type === 'https'">
      <base-select
        v-decorator="decorators.certificate"
        resource="loadbalancercertificates"
        :params="certificateParams"
        show-sync
        :select-props="{ placeholder: $t('network.text_421') }" />
      <div slot="extra">{{$t('network.text_422')}}<help-link href="/lbcert">{{$t('network.text_321')}}</help-link></div>
    </a-form-item>
    <a-collapse :bordered="false">
      <a-collapse-panel :header="$t('network.text_94')" key="1" forceRender>
      <a-form-item :label="$t('network.text_423')" class="mb-0">
        <scheduler-types :decorators="decorators" :form="form" :schedulerTypeOpts="schedulerTypeOpts" />
      </a-form-item>
      <sticky-session :decorators="decorators" :form="form" :disabled="form.fc.getFieldValue('scheduler') === 'wlc'" v-if="['tcp', 'udp'].includes(form.fd.listener_type)" :stickySessionTypeOpts="stickySessionTypeOpts" />
      <a-form-item :label="$t('network.text_426')" v-if="['https'].includes(form.fd.listener_type)">
        <a-switch v-decorator="decorators.enable_http2" />
      </a-form-item>
      <a-form-item :label="$t('network.text_427')" v-if="['http', 'https'].includes(form.fd.listener_type)">
        <a-switch v-decorator="decorators.gzip" />
      </a-form-item>
      <a-form-item :label="$t('network.text_428')" :extra="$t('network.text_429')" v-if="['http', 'https'].includes(form.fd.listener_type)">
        <a-checkbox v-decorator="decorators.xforwarded_for">X-Forwarded-For</a-checkbox>
      </a-form-item>
      </a-collapse-panel>
    </a-collapse>
  </a-form>
</template>

<script>
import mixin from '../mixins/formStepItem'
import { schedulerProviderMaps } from '@Network/views/loadbalancerlistener/constants'

export default {
  name: 'LBListenerCreateProtocol',
  mixins: [mixin],
  data () {
    return {
      stickySessionTypeOpts: [
        {
          key: 'insert',
          label: this.$t('network.text_384'),
        },
      ],
    }
  },
  computed: {
    schedulerTypeOpts () {
      const type = this.lbDetail.brand.toLowerCase()
      if (type) {
        const opts = schedulerProviderMaps[type.toLowerCase()]
        const { listener_type } = this.form.fd
        if ((listener_type === 'tcp' || listener_type === 'udp') && type === 'qcloud') {
          const noUdpScheduler = ['sch', 'tch', 'qch']
          return opts.filter(val => !noUdpScheduler.includes(val.key))
        }
        return opts
      }
      return []
    },
  },
  watch: {
    'form.fd.scheduler' (val) {
      if (val === 'wlc') { // 腾讯云调度策略是wlc时，不允许开启会话保持
        this.form.fc.setFieldsValue({
          [this.decorators.sticky_session[0]]: false,
        })
      }
    },
  },
  methods: {
    async submit () {
      try {
        const values = await this.form.fc.validateFields()
        return values
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
