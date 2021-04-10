<template>
  <a-row :gutter="8">
    <a-col :span="12">
      <a-form-item>
        <a-select v-decorator="decorators.vpc" :loading="vpcLoading" :placeholder="$t('db.text_261')" showSearch :filterOption="filterOption"  @change="(vpc)=>fetchQueryNetworks(vpc, true)">
          <a-select-option  :key="item.id" :value="item.id" v-for="item in vpcOptions">
            <div class="d-flex">
              <span class="text-truncate flex-fill mr-2" :title="item.name">{{ item.name }}</span>
              <span style="color: #8492a6; font-size: 13px">{{$t('db.text_268', [ item.manager ])}}</span>
            </div>
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item>
        <a-select v-decorator="decorators.network" :loading="networkLoading" :placeholder="$t('db.text_269')" showSearch :filterOption="filterOption" @change="handleNetworkChange">
          <a-select-option :key="item.id" :value="item.id" v-for="item in networkOptions">
            <div class="d-flex">
              <span class="text-truncate flex-fill mr-2" :title="item.name">{{ item.name }} ({{item.guest_ip_start}} - {{item.guest_ip_end}}）</span>
              <span style="color: #8492a6; font-size: 13px">{{$t('db.text_270', [ item.ports - item.ports_used ])}}</span>
            </div>
          </a-select-option>
        </a-select>
       </a-form-item>
    </a-col>
  </a-row>
</template>
<script>
import { Manager } from '@/utils/manager'

export default {
  inject: ['form', 'scopeParams'],
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
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    handleNetworkChange (networkId) {
      if (this.networkOptions && this.networkOptions.length > 0) {
        for (let i = 0; i < this.networkOptions.length; i++) {
          const { _id, manager } = this.networkOptions[i]
          if (networkId === _id) {
            this.FC.setFieldsValue({
              manager: manager,
            })
            break
          }
        }
      }
    },
    async fetchQueryVpcs (isUpdate) {
      const sku = this.getFieldValue('sku')
      const params = {
        limit: 0,
        usable: true,
        cloudregion_id: this.getFieldValue('region'),
        ...this.scopeParams,
      }
      if (sku) {
        if ((sku.cloudregion_id === this.cloudregion) && !isUpdate) {
          return false
        }
        params.cloudregion_id = sku.cloudregion_id
        params.provider = sku.provider
        this.cloudregion = sku.cloudregion_id
      }
      this.FC.setFieldsValue({
        vpc: undefined,
        network: undefined,
      })
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
        ...this.scopeParams,
      }
      const sku = this.getFieldValue('sku')
      if (sku) {
        params.zone = sku.zone_id
      }
      this.FC.setFieldsValue({
        network: undefined,
      })
      try {
        this.networkLoading = true
        const { data = {} } = await this.netWrokManager.list({ params })
        this.networkOptions = data.data || []
        if (this.networkOptions && this.networkOptions.length > 0) {
          const { id, manager } = this.networkOptions[0]
          this.FC.setFieldsValue({
            network: id,
            manager: manager,
          })
        }
        this.networkLoading = false
      } catch (err) {
        this.networkLoading = false
        throw err
      }
    },
  },
}
</script>
