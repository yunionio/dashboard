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
        <sticky-session :decorators="decorators" :form="form" v-if="['http'].includes(form.fd.listener_type)" />
        <acl :decorators="decorators" :form="form" :lbDetail="lbDetail" />
        <!-- !!! 下面的这些 v-if 会影响scheduler 的回填(原因未知)，所以在formStepItem里面回填时会单独getFieldDecorator -->
        <a-form-item :label="$t('network.text_424')" v-if="['http', 'https'].includes(form.fd.listener_type)">
          <a-input v-decorator="decorators.client_idle_timeout" :addonAfter="$t('network.text_76')" type="number" />
        </a-form-item>
        <a-form-item :label="$t('network.text_425')" v-if="['http', 'https'].includes(form.fd.listener_type)">
          <a-input v-decorator="decorators.client_request_timeout" :addonAfter="$t('network.text_76')" type="number" />
        </a-form-item>
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
  computed: {
    schedulerTypeOpts () {
      const type = this.lbDetail.brand.toLowerCase()
      if (type) {
        const opts = schedulerProviderMaps[type.toLowerCase()]
        const { listener_type } = this.form.fd
        if ((listener_type !== 'udp' && type === 'aliyun')) {
          const noUdpScheduler = ['sch', 'tch', 'qch']
          return opts.filter(val => !noUdpScheduler.includes(val.key))
        }
        return opts
      }
      return []
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
