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
    <a-form-item label="规格">
      <base-select
        v-decorator="decorators.loadbalancer_spec"
        :options="specOpts"
        :select-props="{ placeholder: '请选择规格' }" />
    </a-form-item>
    <a-form-item label="网络">
      <a-radio-group v-decorator="decorators.address_type" @change="addressTypeChange">
        <a-radio-button value="internet">公网</a-radio-button>
        <a-radio-button value="intranet">私网</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="网络计费模式" v-if="form.fd.address_type === 'internet'">
      <charge-type-radio :decorators="decorators" />
    </a-form-item>
    <a-form-item label="IP版本">
      <a-radio-group v-decorator="decorators.ip">
        <a-radio-button value="ipv4">IPv4</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <template v-if="form.fd.address_type === 'intranet'">
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
    </template>
  </a-form>
</template>

<script>
import { LB_SPEC } from '@Network/views/lb/constants'
import lbCreate from './mixin'
import ChargeTypeRadio from '@/sections/ChargeTypeRadio'

export default {
  name: 'LbAliyunCreate',
  components: {
    ChargeTypeRadio,
  },
  mixins: [lbCreate],
  data () {
    return {
      specOpts: LB_SPEC.aliyun,
    }
  },
  methods: {
    async submit () {
      try {
        const values = await this.form.fc.validateFields()
        if (!this.validateIp()) return
        const data = {
          name: values.name.trim(),
          manager: values.cloudprovider.key,
          zone: values.zone.key,
          address_type: values.address_type,
          project: values.project,
          loadbalancer_spec: values.loadbalancer_spec,
          charge_type: values.charge_type,
        }
        if (values.address_type === 'intranet') {
          data.network = values.network
        }
        if (values.charge_type === 'bandwidth') {
          data.bandwidth = values.bandwidth
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
