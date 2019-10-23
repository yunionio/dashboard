<template>
  <div>
    <a-row :gutter="8">
      <a-col :span="8">
         <a-form-item>
            <a-select  v-decorator="decorators.city" @change="fetchQueryProviders">
                <a-select-option
                    :key="item.name"
                    :value="item.name"
                    v-for="item in cityOpts">{{item.cname}}</a-select-option>
            </a-select>
         </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item>
            <a-select :loading="providerLoading" placeholder="请选择平台" v-decorator="decorators.provider" @change="fetchQueryRegions">
                <a-select-option
                    :key="item.name"
                    :value="item.name"
                    v-for="item in providerOps">{{item.cname}}</a-select-option>
            </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item>
            <a-select :loading="regionLoading" placeholder="请选择区域"  v-decorator="decorators.region">
                <a-select-option
                    :key="item.id"
                    :value="item.id"
                    v-for="item in regionOpts">{{item.name}}</a-select-option>
            </a-select>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
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
}
export default {
  name: 'CityProviderRegionSelects',
  inject: ['form'],
  props: {
    decorators: {
      type: Object,
      default: defaultDecorators,
    },
  },
  data () {
    return {
      cityOpts: [],
      providerLoading: false,
      providerOps: [],
      regionLoading: false,
      regionOpts: [],
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
    },
    async fetchQueryCitys () {
      const params = {
        usable: true,
        service: 'dbinstances',
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
    async fetchQueryProviders () {
      const params = {
        service: 'dbinstances',
        usable: true,
        city: this.getFieldValue('city') || undefined,
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
        }
      } catch (err) {
        this.providerLoading = false
        throw err
      }
    },
    async fetchQueryRegions () {
      const params = {
        service: 'dbinstances',
        usable: true,
        is_public: true,
        city: this.getFieldValue('city') || undefined,
        provider: this.getFieldValue('provider') || undefined,
      }
      try {
        this.regionLoading = true
        const { data } = await this.crManager.list({ params })
        this.regionLoading = false
        this.regionOpts = data.data
      } catch (err) {
        this.regionLoading = false
        throw err
      }
    },
  },
}
</script>
