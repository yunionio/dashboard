<template>
  <a-form :form="form.fc"  class="mt-3" v-bind="formItemLayout">
    <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" class="mb-0">
      <domain-project :fc="form.fc" :decorators="decorators" :domain.sync="domain" :project.sync="project" :labelInValue="false" />
    </a-form-item>
    <a-form-item :label="$t('network.text_199')" class="mb-0">
      <cloudregion-zone :decorator="decorators" :cloudregionParams="cloudregionParams" :zoneParams="zoneParams" :zone.sync="zoneObj" />
    </a-form-item>
    <a-form-item :label="$t('network.text_21')">
      <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
    </a-form-item>
    <a-form-item :label="$t('compute.text_176')">
      <a-radio-group :defaultValue="hypervisorOpts[0].key">
        <a-radio-button v-for="item in hypervisorOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('network.text_19')">
      <base-select
        show-sync
        v-decorator="decorators.cluster_id"
        resource="loadbalancerclusters"
        need-params
        filterable
        :params="clusterParams"
        :select-props="{ placeholder: $t('network.text_79') }" />
      <div slot="extra" v-if="isAdminMode">{{$t('network.text_281')}}<help-link href="/cluster">{{$t('network.text_282')}}</help-link></div>
    </a-form-item>
    <a-form-item :label="$t('network.text_211')">
      <a-row :gutter="8">
        <a-col :span="12">
          <a-select value="default" disabled>
            <a-select-option key="default">
              <span class="text-color-secondary">VPC: </span>Default
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="12">
          <a-form-item>
            <base-select
              v-decorator="decorators.network"
              resource="networks"
              need-params
              filterable
              :params="networkParams"
              :item.sync="networkObj"
              :select-props="{ placeholder: $t('network.text_275') }" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form-item>
  </a-form>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import lbCreate from './mixin'
import CloudregionZone from '@/sections/CloudregionZone'
import { HYPERVISORS_MAP } from '@/constants'

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
    ...mapGetters(['isAdminMode']),
    clusterParams () {
      let params = {}
      if (this.zoneObj && this.zoneObj.id && !R.isEmpty(this.scopeParams)) {
        params.zone = this.zoneObj.id
        params.limit = 0
        params = Object.assign(params, this.scopeParams)
      }
      return params
    },
    networkParams () {
      let params = {
        vpc_id: 'default',
        usable: true,
      }
      if (this.zoneObj && this.zoneObj.id && !R.isEmpty(this.scopeParams)) {
        params.zone = this.zoneObj.id
        params.limit = 0
        params = Object.assign(params, this.scopeParams)
      }
      return params
    },
    cloudregionParams () { // 覆盖 mixin
      return {
        scope: this.$store.getters.scope,
        usable: true,
        is_on_premise: true,
      }
    },
    // 当前只支持oneCloud
    hypervisorOpts () {
      return [HYPERVISORS_MAP.kvm]
    },
  },
  methods: {
    async submit () {
      try {
        const values = await this.form.fc.validateFields()
        if (!this.validateIp()) throw Error(this.$t('network.text_276'))
        const data = {
          cluster_id: values.cluster_id,
          name: values.name.trim(),
          network: values.network,
          domain: values.domain,
          project: values.project,
        }
        return data
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
