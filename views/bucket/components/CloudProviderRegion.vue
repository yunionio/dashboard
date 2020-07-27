<script>
export default {
  name: 'CloudProviderRegion',
  inject: ['form'],
  props: {
    cloudprovideParams: {
      type: Object,
    },
    cloudregionParams: {
      type: Object,
    },
    decorators: {
      type: Object,
    },
    // select默认是否选中第一个option
    defaultActiveFirstOption: {
      type: Boolean,
      default: () => true,
    },
    isRequired: {
      type: Boolean,
      default: () => true,
    },
  },
  data () {
    return {
      cloudproviderLoading: false,
      cloudproviderList: [],
      cloudregionLoading: false,
      cloudregionList: [],
    }
  },
  computed: {
    FC () {
      if (this.form && this.form.fc) {
        return this.form.fc
      }
      return this.$form.createForm(this)
    },
    // 设置默认decorators
    _decorators () {
      const { isRequired } = this
      const manager = ['manager', {
        rules: [
          {
            required: isRequired, message: this.$t('storage.text_92'),
          },
        ],
      }]
      const cloudregion = ['cloudregion_id', {
        rules: [
          {
            required: isRequired, message: this.$t('storage.text_57'),
          },
        ],
      }]
      const _ = {
        manager,
        cloudregion,
      }
      return Object.assign({}, _, this.decorators)
    },
  },
  watch: {
    cloudprovideParams: {
      handler (val, oldVal) {
        this.fetchCloudproviders()
      },
      deep: true,
      immediate: true,
    },
  },
  created () {
    this.fetchCloudproviders()
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    async fetchCloudproviders () {
      const params = Object.assign({}, {
        limit: 0,
        enabled: 1,
        details: true,
        scope: this.$store.getters.scope,
        has_object_storage: true,
      }, this.cloudprovideParams)
      if (this.$store.getters.isAdminMode && params.project_domain) {
        delete params.scope
      }
      this.cloudproviderLoading = true
      const [id] = this._decorators.manager
      this.FC.setFieldsValue({
        [id]: undefined,
      })
      try {
        const manager = new this.$Manager('cloudproviders', 'v2')
        const { data = {} } = await manager.list({ params })
        const list = data.data || []
        this.cloudproviderList = list
        // 选中第一个option
        if (list && list.length > 0 && this.defaultActiveFirstOption) {
          const [id] = this._decorators.manager
          this.FC.setFieldsValue({
            [id]: list[0].id,
          }, () => {
            this.fetchCloudregions({ manager: list[0].id })
          })
        } else {
          const [id] = this._decorators.cloudregion
          this.FC.setFieldsValue({
            [id]: undefined,
          })
          this.cloudregionList = []
        }
      } catch (err) {
        throw err
      } finally {
        this.cloudproviderLoading = false
      }
    },
    async fetchCloudregions (queryParams = {}) {
      const params = Object.assign({}, {
        limit: 0,
        scope: this.$store.getters.scope,
      }, this.cloudregionParams, queryParams)
      if (this.$store.getters.isAdminMode && params.project_domain) {
        delete params.scope
      }
      this.cloudregionLoading = true
      const [id] = this._decorators.cloudregion
      this.FC.setFieldsValue({
        [id]: undefined,
      })
      try {
        const manager = new this.$Manager('cloudregions', 'v2')
        const { data = {} } = await manager.list({ params })
        const list = data.data || []
        this.cloudregionList = list
        if (list && list.length > 0 && this.defaultActiveFirstOption) {
          const [id] = this._decorators.cloudregion
          this.FC.setFieldsValue({
            [id]: list[0].id,
          })
          this.$emit('cloudregionChange', list[0])
        }
      } catch (err) {
        throw err
      } finally {
        this.cloudregionLoading = false
      }
    },
  },
  render () {
    const { getFieldDecorator, setFieldsValue, validateFields } = this.FC
    const { cloudproviderLoading, cloudproviderList, cloudregionLoading, cloudregionList } = this
    const names = ['manager', 'cloudregion']
    const selectConfig = {
      manager: {
        loading: cloudproviderLoading,
        list: cloudproviderList,
        onChange: (manager) => {
          if (manager) {
            this.fetchCloudregions({ manager })
          } else {
            this.cloudregionList = []
            const [id] = this._decorators.cloudregion
            setFieldsValue({
              [id]: undefined,
            }, () => {
              validateFields([id])
            })
          }
        },
      },
      cloudregion: {
        loading: cloudregionLoading,
        list: cloudregionList,
        onChange: (id, vnode) => {
          const { row } = vnode.data.attrs
          this.$emit('cloudregionChange', row)
        },
      },
    }
    const FormItem = ({ children }) => {
      return (
        <a-col span={12}>
          <a-form-item wrapperCol={{ span: 24 }}>
            {children}
          </a-form-item>
        </a-col>
      )
    }
    const selects = names.map(name => {
      const { loading, list = [], onChange } = selectConfig[name]
      const [id, options = {}] = this._decorators[name]
      const select = getFieldDecorator(id, options)(
        <a-select class="w-100" allowClear showSearch filterOption={this.filterOption}loading={loading} onChange={onChange}>
          {
            list.map(item => {
              const { id, name } = item
              return <a-select-option row={item} value={id} >{name}</a-select-option>
            })
          }
        </a-select>,
      )
      return (
        <FormItem>
          {select}
        </FormItem>
      )
    })
    return (
      <a-row gutter={8}>
        {selects}
      </a-row>
    )
  },
}
</script>
