<template>
  <div class="cloudprovider-cloudregion-zone-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="8">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-select label-in-value v-decorator="decorators.cloudprovider" @change="cloudproviderChange" :placeholder="$t('rules.account')" show-search :filterOption="filterOption">
            <a-select-option v-for="item in cloudproviderOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-select label-in-value v-decorator="decorators.cloudregion" @change="cloudregionChange" :placeholder="$t('rules.region')" show-search :filterOption="filterOption">
            <a-select-option v-for="item in cloudregionOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-select label-in-value v-decorator="decorators.zone" @change="zoneChange" :placeholder="$t('rules.zone')" show-search :filterOption="filterOption">
            <a-select-option v-for="item in zoneOpts" :key="item.id">{{ item.name }}</a-select-option>
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
    }
  },
  computed: mapGetters(['isAdminMode', 'scope', 'userInfo']),
  watch: {
    cloudproviderParams: {
      deep: true,
      handler (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.fetchCloudprovider()
        }
      },
    },
    cloudregionParams: {
      deep: true,
      handler (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.fetchCloudprovider()
        }
      },
    },
    zoneParams: {
      deep: true,
      handler (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.fetchCloudprovider()
        }
      },
    },
  },
  created () {
    this.cloudporviderM = new Manager('cloudproviders', 'v2')
    this.zonesM = new Manager('zones', 'v2')
    this.cloudregionsM = new Manager('cloudregions', 'v2')
    this.fetchCloudprovider()
  },
  methods: {
    async fetchCloudprovider () {
      const params = this.cloudproviderParams
      if (this.isAdminMode && !params['project_domain']) {
        params['project_domain'] = this.userInfo.projectDomainId
        delete params.scope
      }
      if (this.isAdminMode && !params['project_domain']) {
        params['project_domain'] = this.userInfo.projectDomainId
        delete params.scope
      }
      const { data: { data = [] } } = await this.cloudporviderM.list({ params })
      this.cloudproviderOpts = data
      if (data && data.length && this.form) {
        const defaultItem = { key: data[0].id, label: data[0].name }
        this.form.fc.setFieldsValue({
          [this.decorators.cloudprovider[0]]: defaultItem,
        })
        this.cloudproviderChange(defaultItem)
      }
    },
    async fetchRegion (cloudproviderObj) {
      const params = {
        ...this.cloudregionParams,
        manager: cloudproviderObj.key,
      }
      if (this.isAdminMode && !params['project_domain']) {
        params['project_domain'] = this.userInfo.projectDomainId
        delete params.scope
      }
      if (this.form) {
        this.form.fc.setFieldsValue({
          [this.decorators.cloudregion[0]]: { key: '', label: '' },
          [this.decorators.zone[0]]: { key: '', label: '' },
        })
      }
      const { data: { data = [] } } = await this.cloudregionsM.list({ params })
      this.cloudregionOpts = data
      if (this.cloudregionOpts.length && this.form) {
        const defaultItem = { key: data[0].id, label: data[0].name }
        this.form.fc.setFieldsValue({
          [this.decorators.cloudregion[0]]: defaultItem,
        })
        this.cloudregionChange(defaultItem)
      }
    },
    async fetchZone (cloudregionObj) {
      const params = Object.assign({}, this.zoneParams, { cloudregion_id: cloudregionObj.key, order_by: 'created_at', order: 'asc' })
      if (this.isAdminMode && !params['project_domain']) {
        params['project_domain'] = this.userInfo.projectDomainId
        delete params.scope
      }
      // 清空可用区
      this.zoneOpts = []
      this.form.fc.setFieldsValue({
        [this.decorators.zone[0]]: { key: '', label: '' },
      })
      if (!params.cloudregion_id) return
      const { data: { data = [] } } = await this.zonesM.list({ params })
      this.zoneOpts = data
      if (this.zoneOpts.length && this.form) {
        const defaultItem = { key: data[0].id, label: data[0].name }
        this.$emit('update:zoneObj', data[0])
        this.form.fc.setFieldsValue({
          [this.decorators.zone[0]]: defaultItem,
        })
      }
    },
    cloudproviderChange (value) {
      const cloudproviderObj = this.cloudproviderOpts.find(val => val.id === value.key)
      this.$emit('update:cloudproviderObj', cloudproviderObj)
      this.fetchRegion(value)
    },
    cloudregionChange (value) {
      const cloudregionObj = this.cloudregionOpts.find(val => val.id === value.key)
      this.$emit('update:cloudregionObj', cloudregionObj)
      this.fetchZone(value)
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
