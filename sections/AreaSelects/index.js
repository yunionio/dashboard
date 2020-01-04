import * as R from 'ramda'
import { CITYS, CLOUD_PROVIDERS_MAP } from '@/constants'

// const Select = {
//   name: 'Select',
//   methods: {
//     filterOption (input, option) {
//       return (
//         option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
//       )
//     },
//   },
//   render (h) {
//     const children = this.$slots.default
//     return (
//       <a-select allowClear showSearch filterOption={this.filterOption} onChange={() => this.$emit('change')}>
//         {children}
//       </a-select>
//     )
//   },
// }

const DEFAULT_PARAMS = {
  usable: true,
}

export default {
  name: 'AreaSelects',
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: '区域',
    },
    names: {
      type: Array,
      default: () => {
        return ['city', 'provider', 'cloudregion', 'zone']
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
    cityParams: {
      type: [Object, Function],
    },
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
  },
  watch: {
    cityParams (val, oldVal) {
      if (R.equals(val, oldVal)) return
      this.fetchs()
    },
  },
  created () {
    this.fetchs()
  },
  data () {
    return {
      cityLoading: false,
      cityList: [],
      providerLoading: false,
      providerList: [],
      cloudregionLoading: false,
      cloudregionList: [],
      zoneLoading: false,
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
      return 24 / this.names.length
    },
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
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
      const { id, fetchNames } = { ...selectItem[key] }
      const selectedValue = this.getSelectedValue(key, id)
      // 清空操作
      if (!id) {
        this.$emit('change', {
          [key]: undefined,
        })
        this.FC.resetFields(fetchNames || [key])
        this.FC.setFieldsValue({
          [key]: undefined,
        })
        return false
      }
      if (fetchNames && fetchNames.length > 0) {
        this.resetValues(fetchNames)
        this.$nextTick(() => {
          this.fetchs(fetchNames)
        })
      }
      this.$emit('change', {
        [key]: {
          id,
          value: selectedValue,
        },
      })
      callback && callback(selectedValue)
    },
    async fetchChange (name, list) {
      const events = this._events || {}
      const changes = events[`${name}FetchSuccess`]
      let _list = list
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
        if (R.type(df) === 'Boolean') {
          this.FC.setFieldsValue({
            [name]: _item.id || _item.name,
          })
        }
        if (R.type(df) === 'Array' && !R.isEmpty(df) && df.indexOf(name) > -1) {
          this.FC.setFieldsValue({
            [name]: _item.id || _item.name,
          })
        }
      } else {
        this.defaultActiveFirstOption = false
      }
      this[`${name}List`] = _list
    },
    async fetchs (fetchNames = this.names) {
      if (fetchNames && fetchNames.length > 0) {
        for (let i = 0; i < fetchNames.length; i++) {
          const name = fetchNames[i]
          const sn = this.firstName(name)
          const fetchFn = this[`fetch${sn}`]
          const getParams = R.is(Function, this[`${name}Params`]) ? await this[`${name}Params`]() : this[`${name}Params`]
          if (this.names.indexOf(name) > -1 && fetchFn) {
            const list = await fetchFn(getParams)
            await this.fetchChange(name, list)
          }
        }
      }
    },
    async fetchCity (queryParams = {}) {
      const params = {
        ...DEFAULT_PARAMS,
        ...queryParams,
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
    RenderCity () {
      const fetchNames = ['provider', 'cloudregion', 'zone']
      const _handleChange = (id) => {
        this.handleChange({
          city: {
            id,
            fetchNames,
          },
        })
      }
      return (
        <a-select allowClear showSearch filterOption={this.filterOption} onChange={_handleChange} loading={this.cityLoading} placeholder="请选择城市">
          {this.cityList.map(city => {
            const { id, name } = city
            return <a-select-option key={id} value={name}>{CITYS[name] || name}</a-select-option>
          })}
        </a-select>
      )
    },
    async fetchProvider (queryParams = {}) {
      const { getFieldsValue } = this.FC
      const { city } = getFieldsValue(this.names)
      const params = {
        city,
        ...DEFAULT_PARAMS,
        ...queryParams,
      }
      this.providerLoading = true
      try {
        const manager = new this.$Manager('cloudregions', 'v2')
        const { data = [] } = await manager.rpc({
          methodname: 'getRegionProviders',
          params,
        })
        return data
      } finally {
        this.providerLoading = false
      }
    },
    RenderProvider () {
      const fetchNames = ['cloudregion', 'zone']
      const _handleChange = (id) => {
        this.handleChange({
          provider: {
            id,
            fetchNames,
          },
        })
      }
      return (
        <a-select allowClear showSearch filterOption={this.filterOption} onChange={_handleChange} loading={this.providerLoading} placeholder="请选择平台">
          {this.providerList.map(provider => {
            const { name } = provider
            return <a-select-option key={name} value={name}>{CLOUD_PROVIDERS_MAP[name] || name}</a-select-option>
          })}
        </a-select>
      )
    },
    async fetchCloudregion (queryParams) {
      const { getFieldsValue } = this.FC
      const { city, provider } = getFieldsValue(this.names)
      const params = {
        city,
        provider,
        ...DEFAULT_PARAMS,
        ...queryParams,
      }
      this.cloudregionLoading = true
      try {
        const manager = new this.$Manager('cloudregions', 'v2')
        const { data = {} } = await manager.list({ params })
        const retList = !R.isEmpty(data.data) ? data.data : []
        return retList
      } finally {
        this.cloudregionLoading = false
      }
    },
    RenderCloudregion () {
      const fetchNames = ['zone']
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
          cloudregion: {
            id,
            fetchNames,
          },
        }, _callback)
      }
      return (
        <a-select allowClear showSearch filterOption={this.filterOption} onChange={_handleChange} loading={this.cloudregionLoading} placeholder="请选择区域">
          {this.cloudregionList.map(cloudregion => {
            const { id, name } = cloudregion
            return <a-select-option key={id} value={id}>{name}</a-select-option>
          })}
        </a-select>
      )
    },
    async fetchZone (queryParams = {}) {
      const { getFieldsValue } = this.FC
      const { city, provider, cloudregion } = getFieldsValue(this.names)
      const params = {
        city,
        provider,
        cloudregion_id: cloudregion,
        ...DEFAULT_PARAMS,
        ...queryParams,
      }
      this.zoneLoading = true
      try {
        const manager = new this.$Manager('zones', 'v2')
        const { data = {} } = await manager.list({
          params,
        })
        const retList = !R.isEmpty(data.data) ? data.data : []
        return retList
      } finally {
        this.zoneLoading = false
      }
    },
    RenderZone () {
      const _callback = (item = {}) => {
        // eslint-disable-next-line camelcase
        const { provider, cloudregion_id } = item
        this.FC.setFieldsValue({
          provider,
          cloudregion: cloudregion_id,
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
        <a-select allowClear showSearch filterOption={this.filterOption} onChange={_handleChange} loading={this.regionLoading} placeholder="请选择可用区">
          {this.zoneList.map(zone => {
            const { id, name } = zone
            return <a-select-option key={id} value={id}>{name}</a-select-option>
          })}
        </a-select>
      )
    },
  },
  render (h) {
    const { getFieldDecorator } = this.FC
    const { names } = this
    const RenderCols = names.map(name => {
      const sn = this.firstName(name)
      let fieldDecorator = getFieldDecorator(name)
      if (this.decorators && this.decorators[name]) {
        const { id, options } = this.decorators[name]
        fieldDecorator = getFieldDecorator(id, options)
      }
      if (this[`Render${sn}`]) {
        const Render = this[`Render${sn}`]()
        return <a-col span={this.colSpan}> {fieldDecorator(Render)} </a-col>
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
