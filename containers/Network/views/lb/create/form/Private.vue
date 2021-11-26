<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" class="mb-0">
      <domain-project :fc="form.fc" :decorators="decorators" :domain.sync="domain" :project.sync="project" :labelInValue="false" />
    </a-form-item>
    <a-form-item :label="$t('network.text_199')" class="mb-0">
      <cloudregion-zone :decorator="decorators" :cloudregionParams="cloudregionParams" :zoneParams="zoneParams" :zone.sync="zoneObj" />
    </a-form-item>
    <a-form-item :label="$t('network.text_21')">
      <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
    </a-form-item>
    <a-form-item :label="$t('common.description')">
      <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
    </a-form-item>
    <a-form-item :label="$t('cloudenv.text_7')">
      <a-row :gutter="9">
        <a-col :span="12">
          <base-select
            v-decorator="decorators.vpc"
            @change="handleVpcChange"
            resource="vpcs"
            filterable
            need-params
            :item.sync="vpcObj"
            :params="vpcParams"
            :labelFormat="vpcLabelFormat"
            :select-props="{ placeholder: $t('network.text_274') }" />
        </a-col>
        <a-col :span="12">
          <base-select
            v-decorator="decorators.network"
            resource="networks"
            need-params
            filterable
            :item.sync="networkObj"
            :params="networkParams"
            :select-props="{ placeholder: $t('network.text_275') }" />
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item :label="$t('network.text_16')" v-if="isHCSO">
      <a-radio-group v-decorator="decorators.address_type">
        <a-radio-button value="internet">{{$t('network.text_270')}}</a-radio-button>
        <a-radio-button value="intranet">{{$t('network.text_271')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('network.text_273')" v-if="isHCSO">
      <a-radio-group v-decorator="decorators.ip">
        <a-radio-button value="ipv4">IPv4</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('network.text_221')" v-if="isHCSO && form.fd.address_type === 'internet'">
      <base-select
        v-decorator="decorators.eip"
        resource="eips"
        need-params
        :params="eipParams"
        :showSync="true"
        :select-props="{ placeholder: $t('network.text_278') }" />
      <div slot="extra">{{$t('system.text_439')}}<help-link href="/eip">{{$t('system.text_440')}}</help-link>
      </div>
    </a-form-item>
    <a-form-item :label="$t('table.title.tag')">
      <tag v-decorator="decorators.__meta__" />
    </a-form-item>
  </a-form>
</template>

<script>
import * as R from 'ramda'
import lbCreate from './mixin'
import CloudregionZone from '@/sections/CloudregionZone'
import { HYPERVISORS_MAP } from '../../../../../../src/constants'

export default {
  name: 'LbOnecloudCreate',
  components: {
    CloudregionZone,
  },
  mixins: [lbCreate],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      zoneObj: {},
      hadVpc: false,
    }
  },
  computed: {
    eipParams () {
      let params = {}
      if (this.form.fd.cloudregion && !R.isEmpty(this.scopeParams)) {
        params = { ...this.scopeParams, usable: true, region: this.form.fd.cloudregion }
        if (this.isAdminMode || this.isDomainMode) {
          params.project = this.form.fd.project
        }
      }
      if (!R.isEmpty(this.vpcObj) && this.vpcObj.manager_id) {
        params.manager_id = this.vpcObj.manager_id
      }
      return params
    },
    isHCSO () {
      if (this.zoneObj) {
        return this.zoneObj.provider === HYPERVISORS_MAP.hcso.provider
      }
      return false
    },
  },
  methods: {
    async submit () {
      const { manager_id } = this.vpcObj
      try {
        const values = await this.form.fc.validateFields()
        const data = {
          manager: manager_id,
          name: values.name.trim(),
          description: values.description,
          project: values.project,
          network: values.network,
          __meta__: values.__meta__,
        }

        if (this.isHCSO) {
          data.zone = values.zone.key
          data.cloudregion = values.cloudregion.key
          data.address_type = values.address_type
          data.ip = values.ip
          data.vpc = values.vpc
          if (values.eip) data.eip = values.eip
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
