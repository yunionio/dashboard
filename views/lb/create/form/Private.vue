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
    <a-form-item label="网络">
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
  </a-form>
</template>

<script>
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
      zoneObj: {},
      hadVpc: false,
    }
  },
  methods: {
    async submit () {
      console.log(this.vpcObj)
      const { manager_id } = this.vpcObj
      try {
        const values = await this.form.fc.validateFields()
        const data = {
          manager: manager_id,
          name: values.name.trim(),
          project: values.project,
          network: values.network,
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
