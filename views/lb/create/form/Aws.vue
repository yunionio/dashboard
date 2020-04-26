<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-form-item :label="`指定${$t('dictionary.project')}`" class="mb-0">
      <domain-project :fc="form.fc" :decorators="decorators" :domain.sync="domain" :project.sync="project" :labelInValue="false" />
    </a-form-item>
    <a-form-item label="名称">
      <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
    </a-form-item>
    <a-form-item label="实例类型">
      <a-radio-group v-decorator="decorators.loadbalancer_spec">
        <a-radio-button value="application">应用型</a-radio-button>
        <a-radio-button value="network">网络型</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="区域" class="mb-0">
      <cloudprovider-region-zone :form="form" :decorators="decorators" :cloudproviderParams="cloudproviderParams" :cloudregionParams="cloudregionParams" :zoneParams="zoneParams" />
    </a-form-item>
    <a-form-item label="网络">
      <a-radio-group v-decorator="decorators.address_type">
        <a-radio-button value="internet">公网</a-radio-button>
        <a-radio-button value="intranet">私网</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="IP版本">
      <a-radio-group v-decorator="decorators.ip">
        <a-radio-button value="ipv4">IPv4</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="专有网络">
      <base-select
        v-decorator="decorators.vpc"
        resource="vpcs"
        need-params
        filterable
        :params="vpcParams"
        :select-props="{ placeholder: '请选择专有网络' }" />
    </a-form-item>
    <a-form-item label="指定IP子网">
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
  name: 'LbAwsCreate',
  mixins: [lbCreate],
  mounted () {
    this.form.fc.setFieldsValue({ // 因为 和 阿里云的规格时一个字段，所以在这里进行初始化
      [this.decorators.loadbalancer_spec[0]]: 'application',
    })
  },
  methods: {
    async submit () {
      try {
        const values = await this.form.fc.validateFields()
        if (!this.validateIp()) throw Error('指定的IP子网必须有大于或等于8个的可用IP才可以被选择创建实例')
        const data = {
          name: values.name.trim(),
          loadbalancer_spec: values.loadbalancer_spec,
          network: values.network,
          manager: values.cloudprovider.key,
          zone: values.zone.key,
          address_type: values.address_type,
          project: values.project,
          vpc: values.vpc,
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
  },
}
</script>
