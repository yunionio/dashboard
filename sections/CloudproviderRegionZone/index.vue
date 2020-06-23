<template>
  <div class="cloudprovider-cloudregion-zone-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="8">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-select label-in-value v-decorator="decorators.cloudregion" @change="cloudregionChange" :placeholder="$t('rules.region')" show-search :filterOption="filterOption" :loading="loading.cloudregion">
            <a-select-option v-for="item in cloudregionOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-select label-in-value v-decorator="decorators.zone" @change="zoneChange" :placeholder="$t('rules.zone')" show-search :filterOption="filterOption" :loading="loading.zone">
            <a-select-option v-for="item in zoneOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-select label-in-value v-decorator="decorators.cloudprovider" :placeholder="$t('rules.account')" show-search :filterOption="filterOption" :loading="loading.cloudprovider">
            <a-select-option v-for="item in cloudproviderOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'

export default {
  name: 'CloudproviderRegionZoneSelect',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: obj => R.is(Array, obj.cloudprovider) && R.is(Array, obj.cloudregion) && R.is(Array, obj.zone),
    },
    cloudproviderParams: {
      type: Object,
      default: () => ({}),
    },
    cloudregionParams: {
      type: Object,
      default: () => ({}),
    },
    zoneParams: {
      type: Object,
      default: () => ({}),
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
  },
  data () {
    return {
      cloudproviderOpts: [],
      cloudregionOpts: [],
      zoneOpts: [],
      loading: {
        cloudregion: false,
        zone: false,
        cloudprovider: false,
      },
    }
  },
  computed: mapGetters(['isAdminMode', 'scope', 'userInfo']),
  watch: {
    cloudproviderParams: {
      deep: true,
      handler (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.fetchRegion()
        }
      },
    },
    cloudregionParams: {
      deep: true,
      handler (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.fetchRegion()
        }
      },
    },
    zoneParams: {
      deep: true,
      handler (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.fetchRegion()
        }
      },
    },
  },
  created () {
    this.cloudporviderM = new Manager('cloudproviders', 'v2')
    this.zonesM = new Manager('zones', 'v2')
    this.cloudregionsM = new Manager('cloudregions', 'v2')
    this.fetchRegion()
  },
  methods: {
    async fetchCloudprovider (cloudregionObj) {
      const params = { ...this.cloudproviderParams, cloudregion: cloudregionObj.key }
      if (this.isAdminMode && !params.project_domain) {
        params.project_domain = this.userInfo.projectDomainId
        delete params.scope
      }
      if (this.isAdminMode && !params.project_domain) {
        params.project_domain = this.userInfo.projectDomainId
        delete params.scope
      }
      // 清空可用区
      this.cloudproviderOpts = []
      this.form.fc.setFieldsValue({
        [this.decorators.cloudprovider[0]]: { key: '', label: '' },
      })
      this.loading.cloudprovider = true
      try {
        const { data: { data = [] } } = await this.cloudporviderM.list({ params })
        this.cloudproviderOpts = data
        this.loading.cloudprovider = false
        if (data && data.length && this.form) {
          const defaultItem = { key: data[0].id, label: data[0].name }
          this.form.fc.setFieldsValue({
            [this.decorators.cloudprovider[0]]: defaultItem,
          })
        }
      } catch (error) {
        this.loading.cloudprovider = false
        throw error
      }
    },
    async fetchRegion () {
      const params = {
        ...this.cloudregionParams,
        // manager: cloudproviderObj.key,
      }
      if (this.isAdminMode && !params.project_domain) {
        params.project_domain = this.userInfo.projectDomainId
        delete params.scope
      }
      if (this.form) {
        this.form.fc.setFieldsValue({
          [this.decorators.cloudregion[0]]: undefined,
          [this.decorators.zone[0]]: undefined,
          [this.decorators.cloudprovider[0]]: undefined,
        })
      }
      this.loading.cloudregion = true
      try {
        const { data: { data = [] } } = await this.cloudregionsM.list({ params })
        this.cloudregionOpts = data
        this.loading.cloudregion = false
        if (this.cloudregionOpts.length && this.form) {
          const defaultItem = { key: data[0].id, label: data[0].name }
          this.form.fc.setFieldsValue({
            [this.decorators.cloudregion[0]]: defaultItem,
          })
          this.cloudregionChange(defaultItem)
        }
      } catch (error) {
        this.loading.cloudregion = false
        throw error
      }
    },
    async fetchZone (cloudregionObj) {
      const params = Object.assign({}, this.zoneParams, { cloudregion_id: cloudregionObj.key, order_by: 'created_at', order: 'asc' })
      if (this.isAdminMode && !params.project_domain) {
        params.project_domain = this.userInfo.projectDomainId
        delete params.scope
      }
      // 清空可用区
      this.zoneOpts = []
      this.form.fc.setFieldsValue({
        [this.decorators.zone[0]]: { key: '', label: '' },
      })
      if (!params.cloudregion_id) return
      this.loading.zone = true
      try {
        const { data: { data = [] } } = await this.zonesM.list({ params })
        this.zoneOpts = data
        this.loading.zone = false
        if (this.zoneOpts.length && this.form) {
          const defaultItem = { key: data[0].id, label: data[0].name }
          this.$emit('update:zoneObj', data[0])
          this.form.fc.setFieldsValue({
            [this.decorators.zone[0]]: defaultItem,
          })
        }
      } catch (error) {
        this.loading.zone = false
        throw error
      }
    },
    cloudregionChange (value) {
      const cloudregionObj = this.cloudregionOpts.find(val => val.id === value.key)
      this.$emit('update:cloudregionObj', cloudregionObj)
      this.fetchZone(value)
      this.fetchCloudprovider(value)
    },
    zoneChange (value) {
      const zoneObj = this.zoneOpts.find(val => val.id === value.key)
      this.$emit('update:zoneObj', zoneObj)
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
