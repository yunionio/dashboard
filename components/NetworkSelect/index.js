import * as R from 'ramda'

export default {
  name: 'NetworkSelect',
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: 'VPC',
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
    vpcFetchParams: {
      type: [Object, Function],
    },
    vpcFetchChange: {
      type: Function,
    },
    networkFetchParams: {
      type: [Object, Function],
    },
    networkFetchChange: {
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
  },
  created () {
    this.fetchs()
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
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
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
    getVpcParams () {
      const _default = {
        limit: 0,
        usable: true,
      }
      if (this.vpcFetchParams) {
        if (R.type(this.vpcFetchParams) === 'Object') {
          return Object.assign({}, _default, this.vpcFetchParams)
        }
        if (R.type(this.vpcFetchParams) === 'Function') {
          const _params = this.vpcFetchParams() || {}
          return Object.assign({}, _default, _params)
        }
      }
      return _default
    },
    async fetchVpc () {
      const PARAMS = this.getVpcParams()
      const MANAGER = new this.$Manager('vpcs', 'v2')
      this.vpcLoading = true
      try {
        const { data = {} } = await MANAGER.list({ params: PARAMS })
        this.vpcList = data.data || []
        this.vpcLoading = false
        if (this.vpcFetchChange) {
          await this.vpcFetchChange(this.vpcList)
        } else {
          await this.FC.setFieldsValue({
            vpc: !R.isEmpty(this.vpcList) ? this.vpcList[0].id : undefined,
          })
        }
      } catch (err) {
        this.vpcLoading = false
        throw err
      }
    },
    RenderVpc () {
      const { vpcLoading, filterOption } = this
      const _handleChange = (vpcId) => {
        const data = this.getSelectedValue('vpc', vpcId)
        this.$emit('vpcChange', data)
        this.$nextTick(() => {
          this.fetchNetwork()
        })
      }
      const options = this.vpcList.map((item) => {
        const { id, name } = item
        return <a-select-option key={id} value={id}>{name}</a-select-option>
      })
      return (
        <a-select onChange={_handleChange} showSearch placeholder="请选择VPC" loading={vpcLoading} filterOption={filterOption} >
          {options}
        </a-select>
      )
    },
    getNetworkParams () {
      const vpc = this.FC.getFieldValue('vpc')
      const _default = {
        vpc,
        limit: 0,
        usable: true,
      }
      if (this.vpcFetchParams) {
        if (R.type(this.networkFetchParams) === 'Object') {
          return Object.assign({}, _default, this.vpcFetchParams)
        }
        if (R.type(this.networkFetchParams) === 'Function') {
          const _params = this.vpcFetchParams() || {}
          return Object.assign({}, _default, _params)
        }
      }
      return _default
    },
    async fetchNetwork () {
      const PARAMS = this.getNetworkParams()
      const MANAGER = new this.$Manager('networks', 'v2')
      this.networkLoading = true
      try {
        const { data = {} } = await MANAGER.list({ params: PARAMS })
        this.networkList = data.data || []
        this.networkLoading = false
        if (this.vpcFetchChange) {
          await this.vpcFetchChange(this.vpcList)
        } else {
          this.FC.setFieldsValue({
            network: !R.isEmpty(this.networkList) ? this.networkList[0].id : undefined,
          })
        }
      } catch (err) {
        this.networkLoading = false
        throw err
      }
    },
    RenderNetwork () {
      const { vpcLoading, filterOption } = this
      const _handleChange = (networkId) => {
        const data = this.getSelectedValue('network', networkId)
        this.$emit('networkChange', data)
      }
      const options = this.networkList.map((item) => {
        const { id, name } = item
        return <a-select-option key={id} value={id}>{name}</a-select-option>
      })
      return (
        <a-select showSearch placeholder="请选择IP子网" onChange={_handleChange} loading={vpcLoading} filterOption={filterOption} >
          {options}
        </a-select>
      )
    },
  },
  render () {
    const { getFieldDecorator } = this.FC
    const RenderCols = this.types.map(name => {
      const sn = this.firstName(name)
      if (this[`Render${sn}`]) {
        const Render = this[`Render${sn}`]()
        return <a-col span={this.colSpan}> {getFieldDecorator(name)(Render)} </a-col>
      }
      return null
    })
    return (
      <a-form-item labelCol={this.labelCol} wrapperCol={this.wrapperCol} label={this.label}>
        <a-row gutter={8}>
          {RenderCols}
        </a-row>
      </a-form-item>
    )
  },
}
