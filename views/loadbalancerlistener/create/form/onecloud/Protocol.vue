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
    <redirect-form-items v-if="['http', 'https'].includes(form.fd.listener_type)" :form="form" />
    <!-- <a-divider orientation="left">{{$t('network.text_94')}}</a-divider> -->
    <a-collapse :bordered="false">
      <a-collapse-panel :header="$t('network.text_94')" key="1" forceRender>
        <!-- 开启重定向 -->
        <div v-if="isLbRedirected">
          <acl :decorators="decorators" :form="form" :lbDetail="lbDetail" :listenerData="listenerData" />
          <a-form-item :label="$t('network.text_424')" v-if="['http', 'tcp', 'udp'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.client_idle_timeout" :addonAfter="$t('network.text_76')" type="number" />
          </a-form-item>
          <a-form-item :label="$t('network.text_425')" v-if="['http'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.client_request_timeout" :addonAfter="$t('network.text_76')" type="number" />
          </a-form-item>
          <a-form-item :label="$t('network.text_426')" v-if="['https'].includes(form.fd.listener_type)">
            <a-switch v-decorator="decorators.enable_http2" />
          </a-form-item>
        </div>
        <div v-if="!isLbRedirected">
          <a-form-item :label="$t('network.text_423')" class="mb-0">
            <scheduler-types :decorators="decorators" :form="form" :schedulerTypeOpts="schedulerTypeOpts" />
          </a-form-item>
          <sticky-session :decorators="decorators" :form="form" v-if="['http', 'https'].includes(form.fd.listener_type)" />
          <acl :decorators="decorators" :form="form" :lbDetail="lbDetail" :listenerData="listenerData" />
          <a-form-item :label="$t('network.text_435')" v-if="['http', 'tcp', 'udp'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.backend_connect_timeout" :addonAfter="$t('network.text_76')" type="number" />
          </a-form-item>
          <a-form-item :label="$t('network.text_436')" v-if="['http', 'tcp', 'udp'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.backend_idle_timeout" :addonAfter="$t('network.text_76')" type="number" />
          </a-form-item>
          <a-form-item :label="$t('network.text_424')" v-if="['http', 'tcp', 'udp'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.client_idle_timeout" :addonAfter="$t('network.text_76')" type="number" />
          </a-form-item>
          <a-form-item :label="$t('network.text_425')" v-if="['http'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.client_request_timeout" :addonAfter="$t('network.text_76')" type="number" />
          </a-form-item>
          <a-form-item :label="$t('network.text_437')" :extra="$t('network.text_438')" v-if="['http', 'https'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.http_request_rate" :addonAfter="$t('network.text_439')" type="number" />
          </a-form-item>
          <a-form-item :label="$t('network.text_440')" :extra="$t('network.text_441')" v-if="['http', 'https'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.http_request_rate_per_src" :addonAfter="$t('network.text_439')" type="number" />
          </a-form-item>
          <a-form-item :label="$t('network.text_426')" v-if="['https'].includes(form.fd.listener_type)">
            <a-switch v-decorator="decorators.enable_http2" />
          </a-form-item>
          <a-form-item :label="$t('network.text_427')" v-if="['http', 'https'].includes(form.fd.listener_type)">
            <a-switch v-decorator="decorators.gzip" />
          </a-form-item>
          <a-form-item :label="$t('network.text_442')" :extra="$t('network.text_443')" v-if="['tcp', 'http', 'https'].includes(form.fd.listener_type)">
            <a-select v-decorator="decorators.send_proxy">
              <a-select-option v-for="(v, k) in proxyOpts" :value="k" :key="k">
                {{v}}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- <a-form-item :label="$t('network.text_428')" :extra="$t('network.text_429')" v-if="['http', 'https'].includes(form.fd.listener_type)">
            <a-checkbox v-decorator="decorators.xforwarded_for">X-Forwarded-For</a-checkbox>
          </a-form-item> -->
          <a-form-item :label="$t('network.text_444')" v-if="['http', 'https'].includes(form.fd.listener_type)">
            <a-checkbox v-decorator="decorators.xforwarded_for">{{$t('network.text_445')}}</a-checkbox>
          </a-form-item>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </a-form>
</template>

<script>
import { mapState } from 'vuex'
import mixin from '../mixins/formStepItem'
import RedirectFormItems from '../../../components/RedirectFormItems'

export default {
  name: 'LBListenerCreateProtocol',
  components: {
    RedirectFormItems,
  },
  mixins: [mixin],
  data () {
    return {
      proxyOpts: {
        off: this.$t('network.text_33'),
        v1: 'V1',
        v2: 'V2',
        'v2-ssl': 'V2-SSL',
        'v2-ssl-cn': 'V2-SSL-CN',
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
