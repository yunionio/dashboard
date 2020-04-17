<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-form-item :label="`指定${$t('dictionary.project')}`" class="mb-0">
      <domain-project :fc="form.fc" :decorators="decorators" :domain.sync="domain" :project.sync="project" :labelInValue="false" />
    </a-form-item>
    <a-form-item label="区域" class="mb-0">
      <cloudregion-zone :decorator="decorators" :cloudregionParams="cloudregionParams" :zoneParams="zoneParams" :zone.sync="zoneObj" />
    </a-form-item>
    <a-form-item label="名称">
      <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
    </a-form-item>
    <a-form-item label="集群">
      <base-select
        v-decorator="decorators.cluster_id"
        resource="loadbalancerclusters"
        need-params
        filterable
        :params="clusterParams"
        :select-props="{ placeholder: '请选择集群' }" />
    </a-form-item>
    <a-form-item label="指定IP子网">
      <base-select
        v-decorator="decorators.network"
        resource="networks"
        need-params
        filterable
        :params="networkParams"
        :item.sync="networkObj"
        :select-props="{ placeholder: '请选择可用IP大于0的网络' }" />
    </a-form-item>
  </a-form>
</template>

<script>
import * as R from 'ramda'
import lbCreate from './mixin'
import CloudregionZone from '@/sections/CloudregionZone'

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
      cloudregionParams: {
        usable: true,
        is_on_premise: true,
      },
      zoneParams: {
        usable: true,
        show_emulated: true,
        order_by: 'created_at',
        order: 'asc',
      },
      zoneObj: {},
    }
  },
  computed: {
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
      let params = {}
      if (this.zoneObj && this.zoneObj.id && !R.isEmpty(this.scopeParams)) {
        params.zone = this.zoneObj.id
        params.limit = 0
        params = Object.assign(params, this.scopeParams)
      }
      return params
    },
  },
  methods: {
    async submit () {
      try {
        const values = await this.form.fc.validateFields()
        if (!this.validateIp()) throw Error('指定的IP子网必须有大于或等于8个的可用IP才可以被选择创建实例')
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
