<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-divider orientation="left">基础配置</a-divider>
    <a-form-item label="名称">
      <a-input :disabled="isUpdate" v-decorator="decorators.generate_name" :placeholder="$t('validator.resourceName')" />
      <name-repeated v-if="!isUpdate" v-slot:extra res="loadbalancerlisteners" :name="form.fd.generate_name" />
    </a-form-item>
    <a-form-item label="监听端口">
      <a-input :disabled="isUpdate" type="number" v-decorator="decorators.listener_port" placeholder="请填写负载均衡对外服务的端口, 端口范围 1-65535" />
    </a-form-item>
    <a-form-item label="协议" class="mb-0">
      <listener-types :decorators="decorators" :disabled="isUpdate" />
    </a-form-item>
    <a-form-item label="证书" v-if="form.fd.listener_type === 'https'">
      <base-select
        v-decorator="decorators.certificate"
        resource="loadbalancercertificates"
        :params="certificateParams"
        show-sync
        :select-props="{ placeholder: '请选择证书' }" />
      <div slot="extra">没有想要的？可以前往<help-link href="/lbcert"> 新建证书</help-link></div>
    </a-form-item>
    <a-collapse :bordered="false">
      <a-collapse-panel header="高级配置" key="1" forceRender>
      <a-form-item label="调度算法" class="mb-0">
        <scheduler-types :decorators="decorators" :form="form" :schedulerTypeOpts="schedulerTypeOpts" />
      </a-form-item>
      <sticky-session :decorators="decorators" :form="form" :disabled="form.fc.getFieldValue('scheduler') === 'wlc'" v-if="['tcp', 'udp'].includes(form.fd.listener_type)" :stickySessionTypeOpts="stickySessionTypeOpts" />
      <a-form-item label="启用HTTP2.0" v-if="['https'].includes(form.fd.listener_type)">
        <a-switch v-decorator="decorators.enable_http2" />
      </a-form-item>
      <a-form-item label="Gzip数据压缩" v-if="['http', 'https'].includes(form.fd.listener_type)">
        <a-switch v-decorator="decorators.gzip" />
      </a-form-item>
      <a-form-item label="获取客户端真实IP" extra="通过X-Forwarded-For头字段获取客户端真实 IP" v-if="['http', 'https'].includes(form.fd.listener_type)">
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
          label: '植入 Cookie',
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
