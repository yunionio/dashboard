<template>
  <div class="cloudregion-zone-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="8">
        <a-form-item>
          <a-select label-in-value v-decorator="decorator.cloudregion" placeholder="区域">
            <a-select-option v-for="item in regionOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item>
          <a-select label-in-value  v-decorator="decorator.vpc" allow-clear placeholder="专有网络">
            <a-select-option v-for="item in vpcOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item>
          <a-select label-in-value  v-decorator="decorator.wire" allow-clear placeholder="二层网络">
            <a-select-option v-for="item in wireOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import { Manager } from '@/utils/manager'

export default {
  name: 'CloudregionVpcWire',
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: obj => R.is(Array, obj.cloudregion) && R.is(Array, obj.vpc) && R.is(Array, obj.wire),
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
  },
  inject: ['form'],
  data () {
    return {
      regionOpts: [],
      vpcOpts: [],
      wireOpts: [],
      regionLoading: false,
      vpcLoading: false,
      wireLoading: false,
    }
  },
  created () {
    this.cloudregionsM = new Manager('cloudregions')
    this.wiresM = new Manager('wires')
    this.fetchRegions()
  },
  methods: {
    fetchRegions () {
      this.regionLoading = true
      this.cloudregionsM.list({ params: this.cloudregionParams })
        .then(({ data: { data = [] } }) => {
          this.regionLoading = false
          this.regionOpts = data
          if (this.regionOpts.length && this.form && this.form.fc) {
            const firstRegion = this.regionOpts[0]
            this.fetchVpcs(firstRegion.id)
            this.form.fc.setFieldsValue({
              cloudregion: { key: firstRegion.id, label: firstRegion.name },
            })
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
            this.fetchWires(firstVpc.id)
            this.form.fc.setFieldsValue({
              vpc: { key: firstVpc.id, label: firstVpc.name },
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
          }
        })
        .catch(() => {
          this.wireLoading = false
        })
    },
  },
}
</script>
