import * as R from 'ramda'

export default {
  name: 'NetworkSelects',
  inject: ['form'],
  props: {
    disabled: {
      type: [Boolean, Array],
      default: false,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    placeholders: {
      type: Object,
      default: () => {
        return {
          vpc: '请选择VPC',
          network: '请选择IP子网',
        }
      },
    },
    label: {
      type: String,
      default: 'IP子网',
    },
    types: {
      type: Array,
      default: () => {
        return ['vpc', 'network']
      },
    },
    form: {
      type: Object,
    },
    vpcParams: {
      type: [Object, Function],
    },
    vpcFetchChange: {
      type: Function,
    },
    vpcFormat: {
      type: Function,
    },
    networkParams: {
      type: [Object, Function],
    },
    networkFetchChange: {
      type: Function,
    },
    networkFormat: {
      type: Function,
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
    defaultActiveFirstOption: {
      type: Boolean,
      default: true,
    },
    isDefaultFetch: {
      type: Boolean,
      default: true,
    },
  },
  created () {
    if (this.isDefaultFetch) {
      this.fetchs()
    }
  },
  data () {
    return {
      vpcList: [],
      vpcLoading: false,
      networkList: [],
      networkLoading: false,
    }
  },
  computed: {
    FC () {
      if (this.form && this.form.fc) {
        return this.form.fc
      }
      return this.$form.createForm(this)
    },
    colSpan () {
      return 24 / this.types.length
    },
  },
  methods: {
    firstName (name) {
      return name.replace(/^\S/, s => s.toUpperCase())
    },
    filterOption (input, option) {
      const subChild = option.componentOptions.children[0]
      if (subChild.text) {
        return (
          subChild.text.toLowerCase().indexOf(input.toLowerCase()) >= 0
        )
      }
      if (subChild.children[0]) {
        return subChild.children[0].data.attrs.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    },
    async fetchs () {
      if (this.types.indexOf('vpc') > -1) {
        await this.fetchVpc()
      }
      if (this.types.indexOf('network') > -1) {
        await this.fetchNetwork()
      }
    },
    getSelectedValue (key, id) {
      const list = (this[`${key}List`] && this[`${key}List`].length > 0) ? this[`${key}List`] : []
      return list.find(item => {
        return item.id === id || item.name === id
      })
    },
    async getVpcParams () {
      const _default = {
        limit: 0,
        usable: true,
      }
      if (this.vpcParams) {
        if (R.type(this.vpcParams) === 'Object') {
          return Object.assign({}, _default, this.vpcParams)
        }
        if (R.type(this.vpcParams) === 'Function') {
          const _params = await this.vpcParams() || {}
          return Object.assign({}, _default, _params)
        }
      }
      return _default
    },
    async fetchVpc () {
      const PARAMS = await this.getVpcParams()
      const MANAGER = new this.$Manager('vpcs', 'v2')
      this.vpcLoading = true
      try {
        const { data = {} } = await MANAGER.list({ params: PARAMS })
        this.vpcList = data.data || []
        this.vpcLoading = false
        if (this.defaultActiveFirstOption) {
          this.FC.setFieldsValue({
            vpc: !R.isEmpty(this.vpcList) ? this.vpcList[0].id : undefined,
          }, this.fetchNetwork)
        }
        if (this.vpcFetchChange) {
          await this.vpcFetchChange(this.vpcList)
        }
      } catch (err) {
        this.vpcLoading = false
        throw err
      }
    },
    RenderVpc () {
      const { vpcLoading, filterOption, disabled } = this
      const _handleChange = (vpcId) => {
        const data = this.getSelectedValue('vpc', vpcId)
        this.$emit('vpcChange', data)
        this.$nextTick(() => {
          this.fetchNetwork()
        })
      }
      const options = this.vpcList.map((item) => {
        const { id, name } = item
        return <a-select-option key={id} value={id}>{this.vpcFormat ? this.vpcFormat(item) : name }</a-select-option>
      })
      return (
        <a-select disabled={disabled} onChange={_handleChange} showSearch placeholder="请选择VPC" loading={vpcLoading} filterOption={filterOption} >
          {options}
        </a-select>
      )
    },
    async getNetworkParams () {
      const vpc = this.FC.getFieldValue('vpc')
      const _default = {
        vpc,
        limit: 0,
        usable: true,
      }
      if (this.networkParams) {
        if (R.type(this.networkParams) === 'Object') {
          return Object.assign({}, _default, this.vpcParams)
        }
        if (R.type(this.networkParams) === 'Function') {
          const _params = await this.networkParams() || {}
          return Object.assign({}, _default, _params)
        }
      }
      return _default
    },
    async fetchNetwork () {
      const PARAMS = await this.getNetworkParams()
      if (this.types.indexOf('vpc') > -1 && !PARAMS.vpc) {
        this.networkList = []
        return false
      }
      const MANAGER = new this.$Manager('networks', 'v2')
      this.networkLoading = true
      try {
        const { data = {} } = await MANAGER.list({ params: PARAMS })
        if (this.networkFetchChange) {
          this.networkList = await this.networkFetchChange(data.data)
        } else {
          this.networkList = (data.data || [])
        }
        if (this.defaultActiveFirstOption) {
          this.FC.setFieldsValue({
            network: !R.isEmpty(this.networkList) ? this.networkList[0].id : undefined,
          })
        }
        if (this.networkFetchChange) {
          await this.networkFetchChange(this.networkList)
        }
      } catch (err) {
        throw err
      } finally {
        this.networkLoading = false
      }
    },
    RenderNetwork () {
      const { networkLoading, filterOption, disabled } = this
      const _handleChange = (networkId) => {
        const data = this.getSelectedValue('network', networkId)
        this.$emit('networkChange', data)
      }
      const options = this.networkList.map((item) => {
        const { id, name } = item
        const text = `${name} (${item.guest_ip_start} - ${item.guest_ip_end}）`
        return <a-select-option key={id} value={id}>
          {this.networkFormat
            ? this.networkFormat(item)
            : (
              <div class='d-flex'>
                <span class='text-truncate flex-fill mr-2' title={ text }>{ text }</span>
                <span style="color: #8492a6; font-size: 13px">可用: { item.ports - item.ports_used }</span>
              </div>
            )
          }
        </a-select-option>
      })
      return (
        <a-select disabled={disabled} showSearch placeholder="请选择IP子网" onChange={_handleChange} loading={networkLoading} filterOption={filterOption} >
          {options}
        </a-select>
      )
    },
  },
  render () {
    const { getFieldDecorator } = this.FC
    const RenderCols = this.types.map(name => {
      const sn = this.firstName(name)
      const options = {}
      const rules = []
      if (this.isRequired) {
        rules.push({
          required: true,
          message: this.placeholders[name],
        })
        options['rules'] = rules
      }
      if (this[`Render${sn}`]) {
        const Render = this[`Render${sn}`]()
        return (
          <a-col span={this.colSpan}>
            <a-form-item wrapperCol={{ span: 24 }}>
              {getFieldDecorator(name, options)(Render)}
            </a-form-item>
          </a-col>
        )
      }
      return null
    })
    return (
      <a-form-item required={this.isRequired} labelCol={this.labelCol} wrapperCol={this.wrapperCol} label={this.label}>
        <a-row gutter={8}>
          {RenderCols}
        </a-row>
      </a-form-item>
    )
  },
}
