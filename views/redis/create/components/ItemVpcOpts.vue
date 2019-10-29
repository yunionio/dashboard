<template>
  <a-row :gutter="8">
    <a-col :span="12">
      <a-form-item>
        <a-select v-decorator="decorators.vpc" :loading="vpcLoading" placeholder="请选择VPC" @change="(vpc)=>fetchQueryNetworks(vpc, true)">
          <a-select-option  :key="item.id" :value="item.id" v-for="item in vpcOptions">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item>
        <a-select :loaidng="networkLoading" :loading="networkLoading" v-decorator="decorators.network" placeholder="请选择子网netwrok">
          <a-select-option :key="item.id" :value="item.id" v-for="item in networkOptions">{{item.name}}</a-select-option>
        </a-select>
       </a-form-item>
    </a-col>
  </a-row>
</template>
<script>
import { Manager } from '@/utils/manager'

export default {
  inject: ['form'],
  props: {
    decorators: {
      type: Object,
      default: () => {
        return []
      },
    },
  },
  data () {
    return {
      vpcLoading: false,
      networkLoading: false,
      vpcOptions: [],
      networkOptions: [],
      cloudregion: undefined,
    }
  },
  computed: {
    FC () {
      if (this.form && this.form.fc) {
        return this.form.fc
      }
      return {}
    },
    getFieldValue () {
      if (this.FC && this.FC.getFieldValue) {
        return this.FC.getFieldValue
      }
      return () => null
    },
  },
  created () {
    this.vpcManager = new Manager('vpcs', 'v2')
    this.netWrokManager = new Manager('networks', 'v2')
  },
  methods: {
    async fetchQueryVpcs () {
      const sku = this.getFieldValue('sku')
      const params = {
        limit: 0,
        usable: true,
      }
      if (sku) {
        if (sku.cloudregion_id === this.cloudregion) {
          return false
        }
        params['cloudregion_id'] = sku.cloudregion_id
        params['provider'] = sku.provider
        params['zone'] = sku.zone_id
      }
      try {
        this.vpcLoading = true
        const { data = {} } = await this.vpcManager.list({ params })
        this.vpcOptions = data.data || []
        if (this.vpcOptions && this.vpcOptions.length > 0) {
          this.FC.setFieldsValue({
            vpc: this.vpcOptions[0].id,
          })
        }
        this.fetchQueryNetworks()
        this.vpcLoading = false
      } catch (err) {
        this.vpcLoading = false
        throw err
      }
    },
    async fetchQueryNetworks (vpc, update) {
      const params = {
        limit: 0,
        usable: true,
        vpc: vpc || this.getFieldValue('vpc'),
      }
      const sku = this.getFieldValue('sku')
      if (sku) {
        if (!update && sku.cloudregion_id === this.cloudregion) {
          return false
        }
        this.cloudregion = sku.cloudregion_id
        params['cloudregion_id'] = sku.cloudregion_id
        params['cloudregion'] = sku.cloudregion_id
        params['provider'] = sku.provider
        params['zone'] = sku.zone_id
      }
      try {
        this.networkLoading = true
        const { data = {} } = await this.netWrokManager.list({ params })
        this.networkOptions = data.data || []
        this.FC.setFieldsValue({
          network: (this.networkOptions && this.networkOptions.length > 0) ? this.networkOptions[0].id : undefined,
        })
        this.networkLoading = false
      } catch (err) {
        this.networkLoading = false
        throw err
      }
    },
  },
}
</script>
