<template>
  <div class="cloudregion-zone-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="8">
        <a-form-item>
          <a-select label-in-value v-decorator="decorator.cloudregion" placeholder="请选择区域" @change="regionChange">
            <a-select-option v-for="item in regionOpts" :key="item.id" :provider="item.provider">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item>
          <a-select label-in-value  v-decorator="decorator.vpc" allow-clear placeholder="请选择专有网络" @change="vpcChange">
            <a-select-option v-for="item in vpcOpts" :key="item.id">{{ item.name }}{{ item.cidr_block ? `（${item.cidr_block}）` : '' }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item>
          <a-select label-in-value  v-decorator="decorator.wire" allow-clear placeholder="请选择二层网络" v-if="show">
            <a-select-option v-for="item in wireOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
          <a-select label-in-value  v-decorator="decorator.zone" allow-clear placeholder="请选择可用区" v-if="!show">
            <a-select-option v-for="item in zonesOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import { SERVER_TYPE } from '@Compute/constants'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'

export default {
  name: 'CloudregionVpcWire',
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: obj => R.is(Array, obj.cloudregion) && R.is(Array, obj.vpc) && (R.is(Array, obj.wire) || R.is(Array, obj.zone)),
    },
    cloudregionParams: {
      type: Object,
      default: () => ({}),
    },
    vpcParams: {
      type: Object,
      default: () => ({}),
    },
    wireParams: {
      type: Object,
      default: () => ({}),
    },
    zoneParams: {
      type: Object,
      default: () => ({}),
    },
  },
  inject: ['form'],
  data () {
    return {
      regionOpts: [],
      vpcOpts: [],
      wireOpts: [],
      zonesOpts: [],
      regionLoading: false,
      vpcLoading: false,
      wireLoading: false,
      zoneLoading: false,
      show: true,
      provider: '',
    }
  },
  computed: mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  watch: {
    cloudregionParams: {
      handler (val) {
        this.$nextTick(() => {
          this.fetchRegions()
          if (this.platformType() === 'idc') {
            this.show = true
          } else {
            this.show = false
          }
        })
      },
      deep: true,
    },
  },
  created () {
    this.cloudregionsM = new Manager('cloudregions')
    this.wiresM = new Manager('wires')
    this.zonesM = new Manager('zones')
    this.fetchRegions()
  },
  methods: {
    platformType () {
      return this.form.fc.getFieldValue('platform_type') || SERVER_TYPE.idc
    },
    regionChange (cloudregion, op) {
      if (op) {
        cloudregion = {
          ...cloudregion,
          provider: op.data.attrs.provider,
        }
      }
      this.fetchVpcs(cloudregion.key)
      if (this.platformType() !== 'idc') {
        if (cloudregion.provider !== 'ZStack') {
          this.fetchZones(cloudregion.key)
          this.show = false
        } else {
          this.show = true
          this.wireOpts = []
        }
      }
      this.provider = cloudregion.provider
      this.form.fc.setFieldsValue({
        cloudregion,
      })
      this.$emit('regionChange', cloudregion.provider)
    },
    vpcChange (vpc) {
      if (this.platformType() === 'idc' || (this.platformType() !== 'idc' && this.provider === 'ZStack')) {
        this.fetchWires(vpc.key)
      }
      this.form.fc.setFieldsValue({
        vpc,
      })
    },
    fetchRegions () {
      this.regionLoading = true
      const params = {
        ...this.cloudregionParams,
      }
      if (this.isAdminMode) {
        params['project_domain'] = this.userInfo.projectDomainId
        delete params.scope
      }
      this.cloudregionsM.list({ params })
        .then(({ data: { data = [] } }) => {
          this.regionLoading = false
          this.regionOpts = data
          if (this.regionOpts.length && this.form && this.form.fc) {
            const firstRegion = this.regionOpts[0]
            this.regionChange({ key: firstRegion.id, label: firstRegion.name, provider: firstRegion.provider })
          }
        })
        .catch(() => {
          this.regionLoading = false
        })
    },
    fetchVpcs (cloudregionId) {
      this.vpcLoading = true
      const params = Object.assign({}, this.vpcParams)
      this.vpcOpts = [] // 清空可用区
      this.cloudregionsM.getSpecific({ id: cloudregionId, spec: 'vpcs', params })
        .then(({ data: { data = [] } }) => {
          this.vpcLoading = false
          this.vpcOpts = data
          if (this.vpcOpts.length && this.form && this.form.fc) {
            const firstVpc = this.vpcOpts[0]
            this.vpcChange({ key: firstVpc.id, label: firstVpc.name })
          } else {
            this.form.fc.setFieldsValue({
              vpc: { key: '', label: '' },
            })
          }
        })
        .catch(() => {
          this.vpcLoading = false
        })
    },
    fetchWires (vpcId) {
      this.wireLoading = true
      const params = Object.assign({}, this.wireParams, { vpc: vpcId })
      this.wireOpts = [] // 清空可用区
      this.wiresM.list({ params })
        .then(({ data: { data = [] } }) => {
          this.wireLoading = false
          this.wireOpts = data
          if (this.wireOpts.length && this.form && this.form.fc) {
            const firstWire = this.wireOpts[0]
            this.form.fc.setFieldsValue({
              wire: { key: firstWire.id, label: firstWire.name },
            })
          } else {
            this.form.fc.setFieldsValue({
              wire: { key: '', label: '' },
            })
          }
        })
        .catch(() => {
          this.wireLoading = false
        })
    },
    fetchZones (cloudregionId) {
      this.zoneLoading = true
      const params = Object.assign({}, this.zoneParams)
      this.zonesOpts = [] // 清空可用区
      this.cloudregionsM.getSpecific({ id: cloudregionId, spec: 'zones', params })
        .then(({ data: { data = [] } }) => {
          this.zoneLoading = false
          this.zonesOpts = data
          if (this.zonesOpts.length && this.form && this.form.fc) {
            const firstZone = this.zonesOpts[0]
            this.form.fc.setFieldsValue({
              zone: { key: firstZone.id, label: firstZone.name },
            })
          } else {
            this.form.fc.setFieldsValue({
              zone: { key: '', label: '' },
            })
          }
        })
        .catch(() => {
          this.zoneLoading = false
        })
    },
  },
}
</script>
