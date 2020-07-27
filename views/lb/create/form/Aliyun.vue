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
    <a-form-item :label="$t('network.text_268')">
      <base-select
        v-decorator="decorators.loadbalancer_spec"
        :options="specOpts"
        :select-props="{ placeholder: $t('network.text_269') }" />
    </a-form-item>
    <a-form-item :label="$t('network.text_16')">
      <a-radio-group v-decorator="decorators.address_type" @change="addressTypeChange">
        <a-radio-button value="internet">{{$t('network.text_270')}}</a-radio-button>
        <a-radio-button value="intranet">{{$t('network.text_271')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('network.text_272')" v-if="form.fd.address_type === 'internet'">
      <charge-type-radio :decorators="decorators" />
    </a-form-item>
    <a-form-item :label="$t('network.text_273')">
      <a-radio-group v-decorator="decorators.ip">
        <a-radio-button value="ipv4">IPv4</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <template v-if="form.fd.address_type === 'intranet'">
      <a-form-item label="VPC">
        <base-select
          v-decorator="decorators.vpc"
          resource="vpcs"
          need-params
          filterable
          :params="vpcParams"
          :select-props="{ placeholder: $t('network.text_274') }" />
      </a-form-item>
      <a-form-item :label="$t('network.text_211')">
        <base-select
          v-decorator="decorators.network"
          resource="networks"
          need-params
          filterable
          :item.sync="networkObj"
          :params="networkParams"
          :select-props="{ placeholder: $t('network.text_275') }" />
      </a-form-item>
    </template>
  </a-form>
</template>

<script>
import lbCreate from './mixin'
import { LB_SPEC } from '@Network/views/lb/constants'
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
        if (!this.validateIp()) throw Error(this.$t('network.text_276'))
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
