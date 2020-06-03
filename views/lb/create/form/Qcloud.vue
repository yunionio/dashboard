<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-form-item :label="`指定${$t('dictionary.project')}`" class="mb-0">
      <domain-project :fc="form.fc" :decorators="decorators" :domain.sync="domain" :project.sync="project" :labelInValue="false" />
    </a-form-item>
    <a-form-item label="名称">
      <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
    </a-form-item>
    <a-form-item label="区域" class="mb-0">
      <cloudprovider-region-zone :form="form" :decorators="decorators" :cloudproviderParams="cloudproviderParams" :cloudregionParams="cloudregionParams" :zoneParams="zoneParams" />
    </a-form-item>
    <a-form-item label="网络">
      <a-radio-group v-decorator="decorators.address_type" @change="addressTypeChange">
        <a-radio-button value="internet">公网</a-radio-button>
        <a-radio-button value="intranet">私网</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="IP版本">
      <a-radio-group v-decorator="decorators.ip">
        <a-radio-button value="ipv4">IPv4</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="VPC">
      <base-select
        v-decorator="decorators.vpc"
        resource="vpcs"
        need-params
        filterable
        :params="vpcParams"
        :select-props="{ placeholder: '请选择VPC' }" />
    </a-form-item>
    <a-form-item label="指定IP子网" v-if="form.fd.address_type === 'intranet'">
      <base-select
        v-decorator="decorators.network"
        resource="networks"
        need-params
        filterable
        :item.sync="networkObj"
        :params="networkParams"
        :select-props="{ placeholder: '请选择可用IP大于0的网络' }" />
    </a-form-item>
  </a-form>
</template>

<script>
import lbCreate from './mixin'

export default {
  name: 'LbQcloudCreate',
  mixins: [lbCreate],
  methods: {
    async submit () {
      try {
        const values = await this.form.fc.validateFields()
        if (!this.validateIp()) throw Error('指定的IP子网必须有大于或等于8个的可用IP才可以被选择创建实例')
        const data = {
          name: values.name.trim(),
          manager: values.cloudprovider.key,
          zone: values.zone.key,
          address_type: values.address_type,
          project: values.project,
          vpc: values.vpc,
        }
        if (values.address_type === 'intranet') {
          data.network = values.network
        }
        if (this.isAdminMode) {
          data.domain = values.domain
          data.admin = true
        }
        return data
      } catch (error) {
        throw error
      }
    },
    addressTypeChange (e) {
      this.form.fd.addressType = e.target.value
    },
  },
}
</script>
