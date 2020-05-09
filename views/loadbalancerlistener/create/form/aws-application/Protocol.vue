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
      <listener-types :decorators="decorators" :disabled="isUpdate" :listenerTypeOpts="listenerTypeOpts" />
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
  </a-form>
</template>

<script>
import mixin from '../mixins/formStepItem'

export default {
  name: 'LBListenerCreateProtocol',
  mixins: [mixin],
  data () {
    return {
      listenerTypeOpts: [
        { label: 'HTTP', key: 'http' },
        { label: 'HTTPS', key: 'https' },
      ],
    }
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
