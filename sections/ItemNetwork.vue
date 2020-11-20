<template>
  <network-selects
    ref="NETWORK"
    :label="$t('db.text_32')"
    :isDefaultFetch="false"
    :vpcFormat="vpcFormat"
    :vpcParams="getVpcParams"
    :networkParams="getNetworkParams"
    v-bind="formItemLayout" />
</template>

<script>
import NetworkSelects from '@/sections/NetworkSelects'

export default {
  name: 'DBItemNetwork',
  components: {
    NetworkSelects,
  },
  inject: ['form', 'formItemLayout', 'scopeParams'],
  methods: {
    vpcFormat (vpc) {
      const { name, manager } = vpc
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ name }>{ name }</span>
          <span style="color: #8492a6; font-size: 13px">{ this.$t('db.text_340', [manager]) }</span>
        </div>
      )
    },
    getVpcParams () {
      const { fd } = this.form
      const params = {
        cloudregion_id: fd.cloudregion_id || fd.cloudregion,
        ...this.scopeParams,
      }
      const zone = this.form.getFieldValue('zone')
      if (zone) {
        params.zone = zone
      }
      return params
    },
    getNetworkParams () {
      const { fd } = this.form
      const params = {
        cloudregion_id: fd.cloudregion_id || fd.cloudregion,
        zone_id: fd.zones || fd.sku.zone_id,
        ...this.scopeParams,
      }
      // zones是rds新建
      const zonesStr = this.form.getFieldValue('zones')
      if (zonesStr) {
        const zoneArr = zonesStr.split('+')
        if (zoneArr && zoneArr.length > 0) {
          // for (let i = 0; i < zoneArr.length; i++) {
          //   params[`zones.${i}`] = zoneArr[i]
          // }
          params['zones.0'] = zoneArr[0]
        }
      }
      // zone是redis新建
      const zone = this.form.getFieldValue('zone')
      if (zone) {
        params.zone = zone
      }
      return params
    },
    fetchVpc () {
      this.$refs.NETWORK.fetchVpc()
    },
  },
}
</script>

<style>

</style>
