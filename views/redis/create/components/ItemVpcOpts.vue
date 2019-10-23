<template>
  <a-row :gutter="8">
    <a-col :span="12">
      <a-select v-decorator="decorators.vpc" placeholder="请选择VPC" @change="fetchQueryNetworks">
        <a-select-option  :key="item.id" :value="item.id" v-for="item in vpcOptions">{{item.name}}</a-select-option>
      </a-select>
    </a-col>
    <a-col :span="12">
      <a-select :loaidng="networkLoading" v-decorator="decorators.network" placeholder="请选择子网netwrok">
        <a-select-option :key="item.id" :value="item.id" v-for="item in networkOptions">{{item.name}}</a-select-option>
      </a-select>
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
    this.fetchQueryVpcs()
  },
  methods: {
    async fetchQueryVpcs () {
      const params = {
        limit: 0,
        usable: true,
      }
      try {
        this.vpcLoading = true
        const { data = {} } = await this.vpcManager.list(params)
        this.vpcOptions = data.data || []
        this.vpcLoading = false
      } catch (err) {
        this.vpcLoading = false
        throw err
      }
    },
    async fetchQueryNetworks (vpc) {
      const params = {
        limit: 0,
        usable: true,
        vpc,
      }
      try {
        this.networkLoading = true
        const { data = {} } = await this.netWrokManager.list({ params })
        this.networkOptions = data.data || []
        this.FC.setFieldsValue({
          vpc: (this.networkOptions && this.networkOptions.length > 0) ? this.networkOptions[0].id : undefined,
        })
      } catch (err) {
        this.networkLoading = false
        throw err
      }
    },
  },
}
</script>
