<template>
  <a-row :gutter="8">
    <a-col :span="6">
      <a-form-item>
        <a-select  v-decorator="decorators.city" @change="fetchQueryProviders">
          <a-select-option
            :key="item.name"
            :value="item.name"
            v-for="item in cityOpts">{{item.cname}}</a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="6">
      <a-form-item>
        <a-select allowClear :loading="providerLoading" placeholder="请选择平台" v-decorator="decorators.provider" @change="fetchQueryRegions">
          <a-select-option
            :key="item.name"
            :value="item.name"
            v-for="item in providerOps">{{item.cname}}</a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="6">
      <a-form-item>
        <a-select allowClear :loading="regionLoading"  placeholder="请选择区域"  v-decorator="decorators.region" @change="handleRegionChange">
          <a-select-option
            :key="item.id"
            :value="item.id"
            v-for="item in regionOpts">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="6">
      <a-form-item>
        <a-select allowClear :loading="regionLoading"  placeholder="请选择可用区"  v-decorator="decorators.zone" @change="handleZoneChange">
          <a-select-option
            :key="item.id"
            :value="item.id"
            v-for="item in zoneOpts">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
  </a-row>
</template>
<script>
import { Manager } from '@/utils/manager'
import { CITYS, CLOUD_PROVIDERS_MAP } from '@/constants'

const defaultDecorators = {
  city: ['city', {
    initialValue: undefined,
  }],
  provider: ['provider', {
    initialValue: undefined,
  }],
  region: ['region', {
    initialValue: undefined,
  }],
  zone: ['zone', {
    initialValue: undefined,
  }],
}
export default {
  name: 'CityProviderRegionSelects',
  inject: ['form'],
  props: {
    decorators: {
      type: Object,
      default: defaultDecorators,
    },
    selectProviders: {
      type: Array,
    },
  },
  data () {
    return {
      cityOpts: [],
      providerLoading: false,
      providerOps: [],
      regionLoading: false,
      regionOpts: [],
      zoneLoading: false,
      zoneOpts: [],
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
    this.crManager = new Manager('cloudregions', 'v2')
    this.fetchs()
  },
  methods: {
    async fetchs () {
      await this.fetchQueryCitys()
      await this.fetchQueryProviders()
      await this.fetchQueryRegions()
      await this.fetchQueryZones()
    },
    async fetchQueryCitys () {
      const params = {
        usable: true,
        // service: 'dbinstances',
      }
      try {
        const { data } = await this.crManager.rpc({
          methodname: 'getRegionCities',
          params,
        })
        if (data && data.length > 0) {
          this.cityOpts = data.map(item => {
            item['cname'] = CITYS[item.name] || item.name
            return item
          })
          this.FC.setFieldsValue({
            city: this.cityOpts[0]['name'],
          })
        }
      } catch (err) {
        throw err
      }
    },
    async fetchQueryProviders (city) {
      const params = {
        // service: 'dbinstances',
        usable: true,
        city: city || undefined,
      }
      this.FC.setFieldsValue({
        provider: undefined,
        region: undefined,
      })
      try {
        this.providerLoading = true
        const { data } = await this.crManager.rpc({
          methodname: 'getRegionProviders',
          params,
        })
        this.providerLoading = false
        if (data && data.length > 0) {
          this.providerOps = data.map(item => {
            item['cname'] = CLOUD_PROVIDERS_MAP[item.name] || item.name
            return item
          })
          if (this.selectProviders && this.selectProviders.length > 0) {
            this.providerOps = this.providerOps.filter(({ name }) => {
              return this.selectProviders.indexOf(name) > -1
            })
          }
        }
      } catch (err) {
        this.providerLoading = false
        throw err
      }
    },
    async fetchQueryRegions (provider) {
      const params = {
        usable: true,
        is_public: true,
        city: this.getFieldValue('city') || undefined,
        provider: provider || undefined,
      }
      this.FC.setFieldsValue({
        region: undefined,
        zone: undefined,
      })
      try {
        this.regionLoading = true
        const { data } = await this.crManager.list({ params })
        if (this.selectProviders && this.selectProviders.length > 0) {
          this.regionOpts = (data.data && data.data.length > 0) ? data.data.filter(({ provider }) => {
            return this.selectProviders.indexOf(provider) > -1
          }) : []
        } else {
          this.regionOpts = data.data || []
        }
        this.fetchQueryZones()
        this.regionLoading = false
      } catch (err) {
        this.regionLoading = false
        throw err
      }
    },
    async fetchQueryZones (region) {
      const params = {
        service: 'zones',
        usable: true,
        is_public: true,
        city: this.getFieldValue('city') || undefined,
        provider: this.getFieldValue('provider') || undefined,
        cloudregion_id: region,
      }
      try {
        this.zoneLoading = true
        const { data } = await new Manager('zones', 'v2').list({
          params,
        })
        if (this.selectProviders && this.selectProviders.length > 0) {
          this.zoneOpts = (data.data && data.data.length > 0) ? data.data.filter(({ provider }) => {
            return this.selectProviders.indexOf(provider) > -1
          }) : []
        } else {
          this.zoneOpts = data.data || []
        }
        this.zoneLoading = false
      } catch (err) {
        this.zoneLoading = false
        throw err
      }
    },
    handleRegionChange (regionId) {
      const regionItem = this.regionOpts.find(({ id }) => {
        return id === regionId
      })
      if (regionItem) {
        const { city, provider } = regionItem
        this.FC.setFieldsValue({
          city,
          provider,
          zone: undefined,
        })
        this.fetchQueryZones(regionId)
      }
    },
    handleZoneChange (zoneId) {
      const zoneItem = this.zoneOpts.find(({ id }) => {
        return id === zoneId
      })
      if (zoneItem) {
        const { provider } = zoneItem
        this.FC.setFieldsValue({
          provider,
          region: zoneItem.cloudregion_id,
        })
      }
    },
  },
}
</script>
