import { CITYS, CLOUD_PROVIDERS_MAP } from '@/constants'

// eslint-disable-next-line no-unused-vars
const Select = {
  name: 'Select',
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
  render (h) {
    const children = this.$slots.default
    const { placeholder, loading } = this.$attrs
    return (
      <a-select allowClear showSearch filterOption={this.filterOption} onChange={() => this.$emit('change')} loading={loading} placeholder={placeholder}>
        {children}
      </a-select>
    )
  },
}

export default {
  name: 'AreaSelect',
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: '区域',
    },
    areas: {
      type: Array,
      default: () => {
        return ['city', 'provider', 'region', 'zone']
      },
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
  },
  data () {
    return {
      cityLoading: false,
      cityList: [],
      providerLoading: false,
      providerList: [],
      regionLoading: true,
      regionList: [],
      zoneLoading: true,
      zoneList: [],
    }
  },
  computed: {
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
      return 24 / this.areas.length
    },
  },
  methods: {
    firstName (name) {
      return name.replace(/^\S/, s => s.toUpperCase())
    },
    resetValues (names) {
      const { setFieldsValue } = this.FC
      const nameObj = {}
      names.forEach(key => {
        nameObj[key] = undefined
      })
      setFieldsValue(nameObj)
    },
    getSelectedValue (key, id) {
      const list = (this[`${key}List`] && this[`${key}List`].length > 0) ? this[`${key}List`] : []
      return list.find(item => {
        return item.id === id || item.name === id
      })
    },
    handleChange (selectItem = {}, callback) {
      const key = Object.keys(selectItem)[0]
      const { id, fetchAreas } = { ...selectItem[key] }
      const selectedValue = this.getSelectedValue(key, id)
      if (fetchAreas && fetchAreas.length > 0) {
        this.resetValues(fetchAreas)
        this.fetchs(fetchAreas)
      }
      this.$emit('change', {
        [key]: {
          id,
          value: selectedValue,
        },
      })
      callback && callback(selectedValue)
    },
    async fetchs (fetchAreas = this.areas) {
      if (fetchAreas && fetchAreas.length > 0) {
        fetchAreas.forEach(name => {
          if (this.areas.indexOf(name) > -1) {
            const sn = this.firstName(name)
            const fetchFn = this[`fetch${sn}`]
            this.$nextTick(() => {
              fetchFn && fetchFn()
            })
          }
        })
      }
    },
    async fetchCity () {
      const params = {
        usable: true,
      }
      this.cityLoading = true
      try {
        const manager = new this.$Manager('cloudregions', 'v2')
        const { data = [] } = await manager.rpc({
          methodname: 'getRegionCities',
          params,
        })
        this.cityLoading = false
        this.cityList = data
        return data
      } catch (err) {
        this.cityLoading = true
        throw err
      }
    },
    RenderCity () {
      const fetchAreas = ['provider', 'region', 'zone']
      const _handleChange = (id) => {
        this.handleChange({
          city: {
            id,
            fetchAreas,
          },
        })
      }
      return (
        <Select onChange={_handleChange} loading={this.cityLoading} placeholder="请选择城市">
          {this.cityList.map(city => {
            const { id, name } = city
            return <a-select-option key={id} value={name}>{CITYS[name] || name}</a-select-option>
          })}
        </Select>
      )
    },
    async fetchProvider () {
      const { getFieldsValue } = this.FC
      const { city } = getFieldsValue(this.areas)
      const params = {
        usable: true,
        city,
      }
      this.providerLoading = true
      try {
        const manager = new this.$Manager('cloudregions', 'v2')
        const { data = [] } = await manager.rpc({
          methodname: 'getRegionProviders',
          params,
        })
        this.providerLoading = false
        this.providerList = data
        return data
      } catch (err) {
        this.providerLoading = true
        throw err
      }
    },
    RenderProvider () {
      const fetchAreas = ['region', 'zone']
      const _handleChange = (id) => {
        this.handleChange({
          provider: {
            id,
            fetchAreas,
          },
        })
      }
      return (
        <Select onChange={_handleChange} loading={this.providerLoading} placeholder="请选择平台">
          {this.providerList.map(provider => {
            const { name } = provider
            return <a-select-option key={name} value={name}>{CLOUD_PROVIDERS_MAP[name] || name}</a-select-option>
          })}
        </Select>
      )
    },
    async fetchRegion () {
      const { getFieldsValue } = this.FC
      const { city, provider } = getFieldsValue(this.areas)
      const params = {
        usable: true,
        city,
        provider,
      }
      this.regionLoading = true
      try {
        const manager = new this.$Manager('cloudregions', 'v2')
        const { data = [] } = await manager.list({ params })
        this.regionLoading = false
        this.regionList = data && data.data.length > 0 ? data.data : []
      } catch (err) {
        this.regionLoading = false
        throw err
      }
    },
    RenderRegion () {
      const fetchAreas = ['zone']
      const { setFieldsValue } = this.FC
      const _callback = (item = {}) => {
        const { city, provider } = item
        setFieldsValue({
          city,
          provider,
        })
      }
      const _handleChange = (id) => {
        this.handleChange({
          region: {
            id,
            fetchAreas,
          },
        }, _callback)
      }
      return (
        <Select onChange={_handleChange} loading={this.regionLoading} placeholder="请选择区域">
          {this.regionList.map(region => {
            const { id, name } = region
            return <a-select-option key={id} value={id}>{name}</a-select-option>
          })}
        </Select>
      )
    },
    async fetchZone () {
      const { getFieldsValue } = this.FC
      const { city, provider, region } = getFieldsValue(this.areas)
      const params = {
        usable: true,
        city,
        provider,
        region,
      }
      this.zoneLoading = true
      try {
        const manager = new this.$Manager('zones', 'v2')
        const { data } = await manager.list({
          params,
        })
        this.zoneLoading = false
        this.zoneList = data && data.data.length > 0 ? data.data : []
      } catch (err) {
        this.zoneLoading = false
        throw err
      }
    },
    RenderZone () {
      const { setFieldsValue } = this.FC
      const _callback = (item = {}) => {
        // eslint-disable-next-line camelcase
        const { provider, cloudregion_id } = item
        setFieldsValue({
          provider,
          region: cloudregion_id,
        })
      }
      const _handleChange = (id) => {
        this.handleChange({
          zone: {
            id,
          },
        }, _callback)
      }
      return (
        <Select onChange={_handleChange} loading={this.regionLoading} placeholder="请选择可用区">
          {this.zoneList.map(zone => {
            const { id, name } = zone
            return <a-select-option key={id} value={id}>{name}</a-select-option>
          })}
        </Select>
      )
    },
  },
  created () {
    this.fetchs()
  },
  render (h) {
    const { getFieldDecorator, getFieldsValue } = this.FC
    const { areas } = this
    const values = getFieldsValue(this.areas)
    const RenderCols = areas.map(name => {
      const sn = this.firstName(name)
      if (this[`Render${sn}`]) {
        const Render = this[`Render${sn}`](values)
        return <a-col span={this.colSpan}> {getFieldDecorator(name)(Render)} </a-col>
      }
      return null
    })
    return (
      <div>
        <a-form-item labelCol={this.labelCol} wrapperCol={this.wrapperCol} label={this.label}>
          <a-row gutter={8}>
            {RenderCols}
          </a-row>
        </a-form-item>
      </div>
    )
  },
}
