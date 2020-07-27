<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" class="mb-0">
      <domain-project :fc="form.fc" :decorators="decorators" :domain.sync="domain" :project.sync="project" :labelInValue="false" />
    </a-form-item>
    <a-form-item :label="$t('network.text_21')">
      <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
    </a-form-item>
    <a-form-item :label="$t('network.text_199')" class="mb-0">
      <cloudprovider-region-zone :form="form" :decorators="decorators" :cloudproviderParams="cloudproviderParams" :cloudregionParams="cloudregionParams" :zoneParams="zoneParams" />
    </a-form-item>
    <a-form-item :label="$t('network.text_16')">
      <a-radio-group v-decorator="decorators.address_type" @change="addressTypeChange">
        <a-radio-button value="internet">{{$t('network.text_270')}}</a-radio-button>
        <a-radio-button value="intranet">{{$t('network.text_271')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('network.text_273')">
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
        :select-props="{ placeholder: $t('network.text_274') }" />
    </a-form-item>
    <a-form-item :label="$t('network.text_211')" v-if="form.fd.address_type === 'intranet'">
      <base-select
        v-decorator="decorators.network"
        resource="networks"
        need-params
        filterable
        :item.sync="networkObj"
        :params="networkParams"
        :select-props="{ placeholder: $t('network.text_275') }" />
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
        if (!this.validateIp()) throw Error(this.$t('network.text_276'))
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
