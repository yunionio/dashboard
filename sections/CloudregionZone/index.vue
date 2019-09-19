<template>
  <div class="cloudregion-zone-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="12">
        <a-form-item>
          <a-select label-in-value v-decorator="decorator.cloudregion">
            <a-select-option v-for="item in regionOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item>
          <a-select label-in-value  v-decorator="decorator.zone" allow-clear>
            <a-select-option v-for="item in zoneOpts" :key="item.id">{{ item.name }}</a-select-option>
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
  name: 'RegionZoneSelect',
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: obj => R.is(Array, obj.cloudregion) && R.is(Array, obj.zone),
    },
    cloudregionParams: {
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
      zoneOpts: [],
    }
  },
  created () {
    this.zonesM = new Manager('zones', 'v2')
    this.cloudregionsM = new Manager('cloudregions', 'v2')
    this.fetchRegions()
  },
  methods: {
    fetchRegions () {
      this.cloudregionsM.list({ params: this.cloudregionParams })
        .then(({ data: { data = [] } }) => {
          this.regionOpts = data
          if (this.regionOpts.length && this.form) {
            const firstRegion = this.regionOpts[0]
            this.fetchZones(firstRegion.id)
            this.form.fc.setFieldsValue({
              cloudregion: { key: firstRegion.id, label: firstRegion.name },
            })
          }
        })
    },
    fetchZones (cloudregionId) {
      const params = Object.assign({}, this.zoneParams, { cloudregion_id: cloudregionId })
      this.zoneOpts = [] // 清空可用区
      this.zonesM.list({ params })
        .then(({ data: { data = [] } }) => {
          this.zoneOpts = data
          if (this.zoneOpts.length && this.form) {
            const firstZone = this.zoneOpts[0]
            this.form.fc.setFieldsValue({
              zone: { key: firstZone.id, label: firstZone.name },
            })
          }
        })
    },
  },
}
</script>
