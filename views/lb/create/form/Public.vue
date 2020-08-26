<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" class="mb-0">
      <domain-project :fc="form.fc" :decorators="decorators" :domain.sync="domain" :project.sync="project" :labelInValue="false" />
    </a-form-item>
    <a-form-item :label="$t('network.text_21')">
      <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
    </a-form-item>
    <area-selects
      v-bind="areaParams"
      @providerFetchSuccess="providerFetchSuccess"
      class="mb-0" />
    <a-form-item :label="$t('network.text_268')" v-if="isAliyun">
      <base-select
        v-decorator="decorators.loadbalancer_spec"
        :options="specOpts"
        :select-props="{ placeholder: $t('network.text_269') }" />
    </a-form-item>
    <a-form-item :label="$t('compute.text_266')" v-if="isAws">
      <a-radio-group v-decorator="decorators.instance_type">
        <a-radio-button v-for="item in instanceOpts" :value="item.key" :label="item.label" :key="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('network.text_16')">
      <a-radio-group v-decorator="decorators.address_type">
        <a-radio-button value="internet">{{$t('network.text_270')}}</a-radio-button>
        <a-radio-button value="intranet">{{$t('network.text_271')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('network.text_272')" v-if="isAliyun && form.fd.address_type === 'internet' ">
      <charge-type-radio :decorators="decorators" />
    </a-form-item>
    <a-form-item :label="$t('network.text_273')">
      <a-radio-group v-decorator="decorators.ip">
        <a-radio-button value="ipv4">IPv4</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('bill.text_233')" v-if="isShowCloudprovider">
      <base-select
        v-decorator="decorators.manager"
        resource="cloudproviders"
        need-params
        filterable
        :params="cloudproviderParams"
        :select-props="{ placeholder: $t('common_588') }" />
    </a-form-item>
    <a-form-item :label="$t('cloudenv.text_7')" v-else>
      <a-row :gutter="9">
        <a-col :span="12">
          <base-select
            v-decorator="decorators.vpc"
            resource="vpcs"
            filterable
            need-params
            :item.sync="vpcObj"
            :params="vpcParams"
            :labelFormat="vpcLabelFormat"
            :select-props="{ placeholder: $t('network.text_274') }" />
        </a-col>
        <a-col :span="12" v-if="(isQcloud && form.fd.address_type === 'intranet') || !isQcloud">
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
    <a-form-item :label="$t('network.text_221')" v-if="isHuawei && form.fd.address_type === 'internet'">
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
  </a-form>
</template>

<script>
import * as R from 'ramda'
import lbCreate from './mixin.js'
import ChargeTypeRadio from '@/sections/ChargeTypeRadio'
import { LB_SPEC } from '@Network/views/lb/constants'
import AreaSelects from '@/sections/AreaSelects'

export default {
  name: 'LbAliyunCreate',
  components: {
    ChargeTypeRadio,
    AreaSelects,
  },
  mixins: [lbCreate],
  data () {
    return {
      specOpts: LB_SPEC.aliyun,
      instanceOpts: LB_SPEC.aws,
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
  },
  methods: {
    vpcLabelFormat (item) {
      if (item.manager) {
        if (item.cidr_block) {
          return (<div><span class="text-color-secondary">VPC:</span> { item.name }<span v-if="item.cidr_block">（{ item.cidr_block }）</span><span class="ml-2 text-color-secondary">云订阅: { item.manager }</span></div>)
        }
        return (<div><span class="text-color-secondary">VPC:</span> { item.name }<span class="ml-2 text-color-secondary">云订阅: { item.manager }</span></div>)
      }
      return (<div>{ item.name }</div>)
    },
    providerFetchSuccess (list) {
      const showProvider = ['Aliyun', 'Aws', 'Qcloud', 'Huawei', 'Qcloud']
      if (list && list.length > 0) {
        return list.filter(item => {
          const { name } = item
          return showProvider.indexOf(name) > -1
        })
      }
      return list
    },
    async submit () {
      try {
        const values = await this.form.fc.validateFields()
        if (!this.validateIp()) throw Error(this.$t('network.text_276'))
        if (!R.isEmpty(this.vpcObj)) {
          values.manager = this.vpcObj.manager
        }
        if (this.isAdminMode) {
          values.admin = true
        } else {
          delete values.domain
        }
        if (this.isAws) {
          values.loadbalancer_spec = values.instance_type
          delete values.instance_type
        }
        return values
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
