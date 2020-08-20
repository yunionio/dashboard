<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    {{vpcObj}}
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
    <a-form-item label="云订阅" v-if="isShowCloudprovider">
      <base-select
        v-decorator="decorators.manager"
        resource="cloudproviders"
        need-params
        filterable
        :params="cloudproviderParams"
        :select-props="{ placeholder: '请选择云订阅' }" />
    </a-form-item>
    <a-form-item label="网络" v-else>
      <a-row :gutter="9">
        <a-col :span="12">
          <base-select
            v-decorator="decorators.vpc"
            resource="vpcs"
            filterable
            need-params
            :item.sync="vpcObj"
            :params="vpcParams"
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
      <eip-config
        hiddenNoneType
        :form="form"
        :decorators="eipDecorators"
        :eipParams="eipParams" />
    </a-form-item>
  </a-form>
</template>

<script>
import * as R from 'ramda'
import lbCreate from './mixin.js'
import EipConfig from '@Compute/sections/EipConfig'
import ChargeTypeRadio from '@/sections/ChargeTypeRadio'
import { LB_SPEC } from '@Network/views/lb/constants'
import AreaSelects from '@/sections/AreaSelects'

export default {
  name: 'LbAliyunCreate',
  components: {
    EipConfig,
    ChargeTypeRadio,
    AreaSelects,
  },
  mixins: [lbCreate],
  data () {
    return {
      specOpts: LB_SPEC.aliyun,
    }
  },
  computed: {
    eipParams () {
      let params = {}
      if (this.form.fd.cloudregion && this.form.fd.cloudregion.key && !R.isEmpty(this.scopeParams)) {
        params = { ...this.scopeParams, usable: true, region: this.form.fd.cloudregion.key }
        if (this.isAdminMode || this.isDomainMode) {
          params.project = this.form.fd.project
        }
      }
      return params
    },
    eipDecorators () {
      const { eip, chargeType, bandwidth } = this.decorators
      console.log(bandwidth)
      return {
        eip,
        charge_type: chargeType,
        bandwidth: [
          'eip_bw',
          {
            initialValue: 1,
            rules: [
              { required: true, message: this.$t('network.text_288'), trigger: 'change', type: 'number' },
            ],
          },
        ],
        type: [
          'eip_type',
          {
            initialValue: 'new',
          },
        ],
      }
    },
  },
  methods: {
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
        return values
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
