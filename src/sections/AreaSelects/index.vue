<template>
  <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="label" :required="isRequired">
    <a-row :gutter="8">
      <a-col v-for="name in names" :key="name" :span="colSpan">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-select
            v-if="name === 'provider'"
            v-decorator="getDecorator(name)"
            :mode="providerMultiple ? 'multiple' : 'default'"
            :allowClear="allowClear"
            dropdownClassName="oc-select-dropdown"
            showSearch
            :filterOption="filterOption"
            :loading="providerLoading"
            :placeholder="placeholders.provider"
            @change="handleProviderChange">
            <a-select-option v-for="provider in providerList" :key="provider.name" :value="provider.name">
              <span class="text-color-secondary option-prefix">{{ $t('compute.text_176') }}: </span>{{ getProviderShowName(provider.name) }}
            </a-select-option>
          </a-select>
          <a-select
            v-else-if="name === 'cloudregion'"
            v-decorator="getDecorator(name)"
            :mode="cloudregionMultiple ? 'multiple' : 'default'"
            :optionLabelProp="cloudregionMultiple ? 'label' : undefined"
            :allowClear="allowClear"
            dropdownClassName="oc-select-dropdown"
            showSearch
            :filterOption="filterOption"
            :loading="cloudregionLoading"
            :placeholder="placeholders.cloudregion"
            @change="handleCloudregionChange">
            <a-select-option
              v-for="cloudregion in cloudregionList"
              :key="cloudregion.id"
              :value="cloudregion.id"
              :label="formatCloudregionOptionLabel(cloudregion)">
              <div v-if="cloudregionMultiple" class="area-select-cloudregion-option">
                <span class="area-select-cloudregion-option__name">{{ formatCloudregionOptionLabel(cloudregion) }}</span>
                <span class="area-select-cloudregion-option__icon">
                  <brand-icon :name="getCloudregionProvider(cloudregion)" />
                </span>
              </div>
              <template v-else-if="names.length === 1">
                {{ _$t(cloudregion) }}
              </template>
              <template v-else>
                <span class="text-color-secondary option-prefix">{{ $t('dictionary.region') }}: </span>{{ _$t(cloudregion) }}
              </template>
            </a-select-option>
          </a-select>
          <a-select
            v-else-if="name === 'zone'"
            v-decorator="getDecorator(name)"
            :mode="zoneMultiple ? 'multiple' : 'default'"
            :optionLabelProp="zoneMultiple ? 'label' : undefined"
            :allowClear="allowClear"
            dropdownClassName="oc-select-dropdown"
            showSearch
            :filterOption="filterOption"
            :loading="zoneLoading"
            :placeholder="placeholders.zone"
            @change="handleZoneChange">
            <a-select-option
              v-for="zone in zoneList"
              :key="zone.id"
              :value="zone.id"
              :label="_$t(zone)">
              <template v-if="names.length === 1">
                {{ _$t(zone) }}
              </template>
              <template v-else>
                <span class="text-color-secondary option-prefix">{{ $t('dictionary.zone') }}: </span>{{ _$t(zone) }}
              </template>
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
  </a-form-item>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { cloudregionFilterByCapability } from '@/utils/common/capability'
import i18n from '@/locales'
import { findAndPush } from '@/utils/utils'
import BrandIcon from '@/sections/BrandIcon'

const DEFAULT_PARAMS = {
  usable: true,
}

export default {
  name: 'AreaSelects',
  components: {
    BrandIcon,
  },
  inject: ['form'],
  props: {
    isRequired: {
      type: Boolean,
      default: false,
    },
    placeholders: {
      type: Object,
      default: () => {
        return {
          // city: i18n.t('rules.city'),
          provider: i18n.t('rules.provider'),
          cloudregion: i18n.t('rules.region'),
          zone: i18n.t('rules.zone'),
        }
      },
    },
    label: {
      type: String,
      default: i18n.t('dictionary.region'),
    },
    names: {
      type: Array,
      default: () => {
        // return ['city', 'provider', 'cloudregion', 'zone']
        return ['provider', 'cloudregion', 'zone']
      },
    },
    decorators: {
      type: Object,
    },
    labelCol: {
      type: Object,
      default: () => {
        return {
          span: 24,
        }
      },
    },
    wrapperCol: {
      type: Object,
      default: () => {
        return {
          span: 24,
        }
      },
    },
    /*
    cityParams: {
      type: [Object, Function],
    },
    */
    providerParams: {
      type: [Object, Function],
    },
    cloudregionParams: {
      type: [Object, Function],
    },
    zoneParams: {
      type: [Object, Function],
    },
    defaultActiveFirstOption: {
      type: [Array, Boolean],
      default: true,
    },
    cloudregionMapper: { // 请求数据后进行数据处理
      type: Function,
      required: false,
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    cloudregionParamsMapper: Function,
    filterBrandResource: String,
    providerMultiple: {
      type: Boolean,
      default: false,
    },
    cloudregionMultiple: {
      type: Boolean,
      default: false,
    },
    zoneMultiple: {
      type: Boolean,
      default: false,
    },
    providerMapper: Function,
    zoneMapper: Function,
  },
  data () {
    return {
      // cityLoading: false,
      // cityList: [],
      providerLoading: false,
      providerList: [],
      cloudregionLoading: false,
      cloudregionList: [], // 未经过mapper的数据
      zoneLoading: false,
      zoneList: [],
    }
  },
  computed: {
    ...mapGetters(['capability']),
    FC () {
      if (this.form && this.form.fc) {
        return this.form.fc
      }
      return this.$form.createForm(this)
    },
    formItemLayout () {
      return {
        labelCol: this.labelCol,
        wrapperCol: this.wrapperCol,
      }
    },
    colSpan () {
      return 24 / this.names.length
    },
  },
  watch: {
    /*
    cityParams (val, oldVal) {
      if (R.equals(val, oldVal)) return
      this.fetchs()
    },
    */
    providerParams (val, oldVal) {
      if (R.equals(val, oldVal)) return
      this.fetchs()
    },
    cloudregionParams (val, oldVal) {
      if (R.equals(val, oldVal)) return
      this.fetchs(['cloudregion', 'zone'])
    },
    'form.fd.billType' (val, oldVal) {
      if (R.equals(val, oldVal)) return
      this.fetchs()
    },
    providerMultiple () {
      this.syncMultipleMode('provider')
    },
    cloudregionMultiple () {
      this.syncMultipleMode('cloudregion')
    },
    zoneMultiple () {
      this.syncMultipleMode('zone')
    },
  },
  created () {
    this.fetchs()
  },
  methods: {
    isMultiple (name) {
      if (name === 'provider') return this.providerMultiple
      if (name === 'cloudregion') return this.cloudregionMultiple
      if (name === 'zone') return this.zoneMultiple
      return false
    },
    emptyFieldValue (name) {
      return this.isMultiple(name) ? [] : undefined
    },
    isEmptyFieldValue (name, value) {
      if (this.isMultiple(name)) {
        return !value || (Array.isArray(value) && value.length === 0)
      }
      return !value
    },
    toArray (value) {
      if (Array.isArray(value)) return value
      return value ? [value] : []
    },
    appendParamsFilter (params, filter) {
      if (!filter) return params
      const next = { ...params }
      if (!next.filter && !next['filter.0']) {
        next.filter = filter
        return next
      }
      if (next.filter) {
        next['filter.0'] = next.filter
        delete next.filter
      }
      let idx = 0
      while (next[`filter.${idx}`]) idx++
      next[`filter.${idx}`] = filter
      return next
    },
    applyProviderParam (params, provider) {
      const list = this.toArray(provider).filter(Boolean)
      const next = { ...params }
      delete next.provider
      if (list.length > 1) {
        return this.appendParamsFilter(next, `provider.in(${list.join(',')})`)
      }
      if (list.length === 1) {
        next.provider = list[0]
      }
      return next
    },
    applyCloudregionParam (params, cloudregion) {
      const list = this.toArray(cloudregion).filter(Boolean)
      const next = { ...params }
      delete next.cloudregion_id
      if (list.length > 1) {
        return this.appendParamsFilter(next, `cloudregion_id.in(${list.join(',')})`)
      }
      if (list.length === 1) {
        next.cloudregion_id = list[0]
      }
      return next
    },
    getDecorator (name) {
      if (this.decorators && this.decorators[name]) {
        return this.decorators[name]
      }
      const options = {}
      if (this.isRequired) {
        options.rules = [{ required: true, message: this.placeholders[name] }]
      }
      if (this.isMultiple(name)) {
        options.initialValue = []
      }
      return [name, options]
    },
    getProviderShowName (name = '') {
      const cloudProvidersMap = this.$t('scopeCloudProvidersMap')
      let showName = cloudProvidersMap[name.toLowerCase()] || name
      if (showName === 'OneCloud') showName = this.$t('brand')
      return showName
    },
    getCloudregionProvider (item = {}) {
      return item.provider || item.brand || ''
    },
    formatCloudregionOptionLabel (item = {}) {
      const name = this._$t(item)
      const provider = this.getCloudregionProvider(item)
      if (!provider) return name
      const showProvider = this.getProviderShowName(provider)
      return `${name}（${showProvider}）`
    },
    syncMultipleMode (name) {
      const value = this.FC.getFieldValue(name)
      if (this.isMultiple(name)) {
        if (value === undefined || value === null) {
          this.FC.setFieldsValue({ [name]: [] })
        } else if (!Array.isArray(value)) {
          this.FC.setFieldsValue({ [name]: [value] })
        }
        return
      }
      if (Array.isArray(value)) {
        this.FC.setFieldsValue({ [name]: value[0] || undefined })
      }
    },
    handleProviderChange (id) {
      this.handleChange({
        provider: {
          id,
          fetchNames: ['cloudregion', 'zone'],
        },
      })
    },
    handleCloudregionChange (id) {
      this.handleChange({
        cloudregion: {
          id,
          fetchNames: ['zone'],
        },
      }, this.cloudregionChangeCallback)
    },
    async cloudregionChangeCallback (item = {}) {
      const { setFieldsValue, getFieldsValue } = this.FC
      const fields = getFieldsValue()
      // 多选模式不回写 provider
      if (this.providerMultiple || this.cloudregionMultiple) {
        return
      }
      if (Array.isArray(item)) {
        const providers = [...new Set(item.map(i => i.provider || i.brand).filter(Boolean))]
        if (providers.length && this.isEmptyFieldValue('provider', fields.provider) && this.names.indexOf('provider') !== -1) {
          setFieldsValue({
            provider: this.providerMultiple ? providers : providers[0],
          })
        }
        return
      }
      const { city = 'Other', provider } = item
      setFieldsValue({
        city,
        provider: this.providerMultiple ? this.toArray(provider) : provider,
      })
      if (this.isEmptyFieldValue('provider', fields.provider) && this.names.indexOf('provider') !== -1) { // 当跳过provider直接选中cloudregion时，cloudregion 本身也要根据cloudprovider过滤, 当不需要显示provider时，不需要再过滤
        this.cloudregionList = await this.fetchCloudregion({
          city,
          provider,
          ...this.cloudregionParams,
        })
      }
    },
    handleZoneChange (id) {
      this.handleChange({
        zone: {
          id,
        },
      }, this.zoneChangeCallback)
    },
    async zoneChangeCallback (item = {}) {
      const fields = this.FC.getFieldsValue()
      // 多选模式：只更新 zone，不回写上游
      if (this.providerMultiple || this.cloudregionMultiple || this.zoneMultiple) {
        return
      }
      if (Array.isArray(item)) {
        const providers = [...new Set(item.map(i => i.provider).filter(Boolean))]
        const cloudregionIds = [...new Set(item.map(i => i.cloudregion_id).filter(Boolean))]
        if (providers.length || cloudregionIds.length) {
          this.FC.setFieldsValue({
            provider: this.providerMultiple ? providers : providers[0],
            cloudregion: this.cloudregionMultiple ? cloudregionIds : cloudregionIds[0],
          })
        }
        return
      }
      const { provider, cloudregion_id } = item
      if (this.isEmptyFieldValue('cloudregion', fields.cloudregion)) { // 当跳过cloudregion直接选中zone时
        const param = {
          city: fields.city,
          provider,
          ...this.cloudregionParams,
        }
        if (this.names.indexOf('provider') === -1) delete param.provider
        this.cloudregionList = await this.fetchCloudregion(param)
      }
      if (this.isEmptyFieldValue('zone', fields.zone)) { // 当跳过cloudregion直接选中zone时，zone 本身也要根据cloudregion过滤
        const param = {
          city: fields.city,
          provider,
          cloudregion_id,
          ...this.zoneParams,
        }
        if (this.names.indexOf('provider') === -1) delete param.provider
        this.zoneList = await this.fetchZone(param)
      }
      this.FC.setFieldsValue({
        provider: this.providerMultiple ? this.toArray(provider) : provider,
        cloudregion: this.cloudregionMultiple ? this.toArray(cloudregion_id) : cloudregion_id,
      })
    },
    resetSelect (names = this.names, callback) {
      const _F = () => {}
      let _resolve = _F
      const promise = new Promise((resolve) => {
        _resolve = resolve
      })
      const _ = {}
      if (names && !R.isEmpty(names)) {
        names.forEach(k => {
          _[k] = this.emptyFieldValue(k)
        })
        this.FC.setFieldsValue(_, () => {
          _resolve(names)
          callback && callback()
        })
      }
      return promise
    },
    filterOption (input, option) {
      const label = option.data && option.data.attrs && option.data.attrs.label
      if (label) {
        return String(label).toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      const lastIdx = option.componentOptions.children.length - 1
      return (
        option.componentOptions.children[lastIdx].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    firstName (name) {
      return name.replace(/^\S/, s => s.toUpperCase())
    },
    resetValues (names) {
      const { setFieldsValue } = this.FC
      const nameObj = {}
      names.forEach(key => {
        nameObj[key] = this.emptyFieldValue(key)
      })
      setFieldsValue(nameObj)
    },
    getSelectedValues (key, ids) {
      const list = (this[`${key}List`] && this[`${key}List`].length > 0) ? this[`${key}List`] : []
      return this.toArray(ids).map(id => {
        return list.find(item => item.id === id || item.name === id)
      }).filter(Boolean)
    },
    getSelectedValue (key, id) {
      if (this.isMultiple(key)) {
        return this.getSelectedValues(key, id)
      }
      const list = (this[`${key}List`] && this[`${key}List`].length > 0) ? this[`${key}List`] : []
      return list.find(item => {
        return item.id === id || item.name === id
      })
    },
    handleChange (selectItem = {}, callback) {
      const key = Object.keys(selectItem)[0]
      const { id, fetchNames } = { ...selectItem[key] }
      // 清空操作
      if (this.isEmptyFieldValue(key, id)) {
        this.$emit('change', {
          [key]: undefined,
        })
        this.FC.resetFields(fetchNames || [key])
        this.FC.setFieldsValue({
          [key]: this.emptyFieldValue(key),
        })
        return false
      }
      this.FC.setFieldsValue({
        [key]: id,
      })
      if (fetchNames && fetchNames.length > 0) {
        this.resetValues(fetchNames)
        this.$nextTick(() => {
          this.fetchs(fetchNames)
        })
      }
      const selectedValue = this.getSelectedValue(key, id)
      this.$emit('change', {
        [key]: {
          id,
          value: selectedValue,
        },
      })
      callback && callback(selectedValue)
    },
    async fetchChange (name, list = []) {
      const events = this._events || {}
      const changes = events[`${name}FetchSuccess`]
      let _list = findAndPush(list, ({ name }) => name === 'Other')
      if (changes && changes.length > 0) {
        const changeFetchSuccess = changes[0]
        const value = await changeFetchSuccess(list, this.FC)
        if (value && R.type(value) === 'Array') {
          _list = value
        }
      }
      /** 默认是否选择list的第一条 */
      const _item = !R.isEmpty(_list) ? _list[0] : null
      if (this.defaultActiveFirstOption && _item) {
        const df = this.defaultActiveFirstOption
        const defaultValue = this.isMultiple(name)
          ? [_item.id || _item.name]
          : (_item.id || _item.name)
        if (R.type(df) === 'Boolean') {
          this.FC.setFieldsValue({
            [name]: defaultValue,
          })
        }
        if (R.type(df) === 'Array' && !R.isEmpty(df) && df.indexOf(name) > -1) {
          this.FC.setFieldsValue({
            [name]: defaultValue,
          })
        }
        this.$emit('change', {
          [name]: {
            id: defaultValue,
            value: this.isMultiple(name) ? [_item] : _item,
          },
        })
      }
      this[`${name}List`] = _list
      return _list
    },
    async fetchs (fetchNames = this.names) {
      await this.resetSelect(fetchNames)
      if (fetchNames && fetchNames.length > 0) {
        for (let i = 0; i < fetchNames.length; i++) {
          const name = fetchNames[i]
          const sn = this.firstName(name)
          const fetchFn = this[`fetch${sn}`]
          const getParams = R.is(Function, this[`${name}Params`]) ? await this[`${name}Params`]() : this[`${name}Params`]
          if (this.names.indexOf(name) > -1 && fetchFn) {
            const resList = await fetchFn(getParams)
            const list = await this.fetchChange(name, resList) // 把mapper函数对list有过滤的情况考虑进去，list应该是mapper后的return值
            if (list.length === 0) {
              const nextNames = fetchNames.slice(i, fetchNames.length)
              nextNames.forEach(name => {
                this[`${name}List`] = []
              })
              this.FC.resetFields(nextNames)
              return
            }
            if (R.type(list) === 'Array' && list.length === 0) {
              const nextNames = fetchNames.slice(i, fetchNames.length)
              if (nextNames.length > 0) {
                this.resetSelect(nextNames)
              }
              return false
            }
          }
        }
      }
    },
    /*
    async fetchCity (queryParams = {}) {
      const params = {
        ...DEFAULT_PARAMS,
        ...queryParams,
        public_cloud: true,
      }
      this.cityLoading = true
      try {
        const manager = new this.$Manager('cloudregions', 'v2')
        const { data = [] } = await manager.rpc({
          methodname: 'getRegionCities',
          params,
        })
        return data
      } finally {
        this.cityLoading = false
      }
    },
    */
    async fetchProvider (queryParams = {}) {
      // const { getFieldsValue } = this.FC
      // const { city } = getFieldsValue(this.names)
      const params = {
        // city,
        ...DEFAULT_PARAMS,
        ...queryParams,
      }
      this.providerLoading = true
      try {
        const manager = new this.$Manager('cloudregions', 'v2')
        const { data: providerData = [] } = await manager.rpc({
          methodname: 'getRegionProviders',
          params,
        })
        const filteredList = this.filterBrandResource
          ? cloudregionFilterByCapability({
            dataList: providerData,
            capability: this.capability,
            regionKey: 'name',
            resource: this.filterBrandResource,
          })
          : providerData
        return this.providerMapper ? this.providerMapper(filteredList) : filteredList
      } finally {
        this.providerLoading = false
      }
    },
    async fetchCloudregion (queryParams = {}) {
      const { getFieldsValue } = this.FC
      const { provider } = getFieldsValue(this.names)
      let params = {
        capability: 'compute',
        ...DEFAULT_PARAMS,
        ...queryParams,
      }
      params = this.applyProviderParam(params, provider)
      if (queryParams.is_on_premise || (params.cloud_env && params.cloud_env === 'onpremise')) {
        delete params.capability
      }
      if (this.cloudregionParamsMapper) {
        params = this.cloudregionParamsMapper(params)
      }
      this.cloudregionLoading = true
      try {
        const manager = new this.$Manager('cloudregions', 'v2')
        const { data = {} } = await manager.list({ params })
        let retList = !R.isEmpty(data.data) ? data.data : []
        // 剔除只读云
        if (this.filterBrandResource) {
          retList = cloudregionFilterByCapability({
            dataList: retList,
            capability: this.capability,
            resource: this.filterBrandResource,
          })
        }
        if (this.cloudregionMapper) {
          retList = this.cloudregionMapper(retList)
        }
        const genList = {}
        retList.map(item => {
          genList[item.id] = item
        })
        this.$emit('update:region', genList)
        return retList
      } finally {
        this.cloudregionLoading = false
      }
    },
    async fetchZone (queryParams = {}) {
      const { getFieldsValue } = this.FC
      const { city, provider, cloudregion } = getFieldsValue(this.names)
      let params = {
        city,
        ...DEFAULT_PARAMS,
        ...queryParams,
      }
      params = this.applyProviderParam(params, provider)
      params = this.applyCloudregionParam(params, cloudregion)
      this.zoneLoading = true
      try {
        const manager = new this.$Manager('zones', 'v2')
        const { data = {} } = await manager.list({
          params,
        })
        let retList = !R.isEmpty(data.data) ? data.data : []
        if (this.zoneMapper) {
          retList = this.zoneMapper(retList)
        }
        const genList = {}
        retList.map(item => {
          genList[item.id] = item
        })
        this.$emit('update:zone', genList)
        return retList
      } catch (error) {
        throw error
      } finally {
        this.zoneLoading = false
      }
    },
  },
}
</script>
