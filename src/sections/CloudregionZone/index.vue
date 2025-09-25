<template>
  <div class="cloudregion-zone-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="12">
        <a-form-item :wrapperCol="{ span: 24 }">
          <cloudregion v-decorator="decorator.cloudregion" @change="handleChange" :options="regionOpts" :disabledRegion="disabledRegion" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item :wrapperCol="{ span: 24 }">
          <zone v-decorator="decorator.zone" @change="v => emit(v, 'zone')" :options="zoneOpts" />
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'
import { cloudregionFilterByCapability } from '@/utils/common/capability'
import Cloudregion from './components/Cloudregion'
import Zone from './components/Zone'

export default {
  name: 'RegionZoneSelect',
  components: {
    Cloudregion,
    Zone,
  },
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
    // 选择过滤掉哪些资源的只读云
    filterBrandResource: String,
    disabledRegion: Boolean,
  },
  inject: ['form'],
  data () {
    return {
      regionOpts: [],
      zoneOpts: [],
    }
  },
  computed: mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable', 'capability']),
  watch: {
    cloudregionParams: {
      deep: true,
      handler (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.fetchRegions()
        }
      },
    },
  },
  created () {
    this.zonesM = new Manager('zones', 'v2')
    this.cloudregionsM = new Manager('cloudregions', 'v2')
    this.fetchRegions()
  },
  methods: {
    emit (item, emitStr) {
      const opts = this.regionOpts.concat(this.zoneOpts)
      let itemObj = {}
      if (R.is(String, item)) {
        itemObj = opts.find(val => val.id === item)
      } else if (R.is(Object, item)) {
        itemObj = opts.find(val => val.id === (item.id || item.key))
      }
      this.$emit(`update:${emitStr}`, itemObj)
    },
    fetchRegions () {
      const params = {
        ...this.cloudregionParams,
      }
      if (this.isAdminMode && !params.project_domain) {
        params.project_domain = this.userInfo.projectDomainId
        delete params.scope
        delete params.domain_id
      }
      if (this.form) {
        this.form.fc.setFieldsValue({
          cloudregion: { key: '', label: '' },
          zone: { key: '', label: '' },
        })
      }
      this.cloudregionsM.list({ params })
        .then(({ data: { data = [] } }) => {
          // 根据全局capability剔除掉只读云的cloudregion
          if (this.filterBrandResource) {
            this.regionOpts = cloudregionFilterByCapability({
              capability: this.capability,
              resource: 'compute_engine',
              dataList: data,
            })
          } else {
            this.regionOpts = data
          }
          this.$emit('update:closeregionOpts', this.regionOpts)
          if (this.regionOpts.length && this.form) {
            const firstRegion = (this.decorator.cloudregion[1].initialValue && this.regionOpts.find(item => item.id === this.decorator.cloudregion[1].initialValue?.key)) ? this.regionOpts.find(item => item.id === this.decorator.cloudregion[1].initialValue?.key) : this.regionOpts[0]
            this.emit(firstRegion, 'cloudregion')
            this.fetchZones(firstRegion.id)
            this.form.fc.setFieldsValue({
              cloudregion: { key: firstRegion.id, label: firstRegion.name },
            })
          }
        })
    },
    fetchZones (cloudregionId) {
      let zoneUsable = false
      if (this.cloudregionParams && this.cloudregionParams.usable) {
        zoneUsable = true
      }
      const params = Object.assign({}, this.zoneParams, { cloudregion_id: cloudregionId, usable: zoneUsable, order_by: 'created_at', order: 'asc' })
      // 清空可用区
      this.zoneOpts = []
      this.emit({}, 'zone')
      this.form && this.form.fc.setFieldsValue({
        zone: { key: '', label: '' },
      })
      if (!params.cloudregion_id) return
      this.zonesM.list({ params })
        .then(({ data: { data = [] } }) => {
          this.zoneOpts = data
          if (this.zoneOpts.length && this.form) {
            const firstZone = (this.decorator.zone[1].initialValue && this.zoneOpts.find(item => item.id === this.decorator.zone[1].initialValue?.key)) ? this.zoneOpts.find(item => item.id === this.decorator.zone[1].initialValue?.key) : this.zoneOpts[0]
            this.emit(firstZone, 'zone')
            this.form.fc.setFieldsValue({
              zone: { key: firstZone.id, label: firstZone.name },
            })
          }
        })
    },
    handleChange (value) {
      let cloudregionId
      if (R.is(String, value)) {
        cloudregionId = value
      } else if (R.is(Object, value)) {
        cloudregionId = value.key
      }
      const selectedRegionOption = this.regionOpts.filter(item => item.id === cloudregionId)[0]
      this.emit(selectedRegionOption, 'cloudregion')
      this.fetchZones(cloudregionId)
    },
  },
}
</script>
