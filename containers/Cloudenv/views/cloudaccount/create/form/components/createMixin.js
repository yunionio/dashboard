import * as R from 'ramda'
import { PROVIDER_MAP, EXTRA_HYPERVISORS } from '@/constants'
import { keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import BlockedResources from '@Cloudenv/views/cloudaccount/components/BlockedResources'

export default {
  components: {
    BlockedResources,
  },
  props: {
    provider: {
      type: String,
      required: true,
    },
    cloneData: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    let initialProject = {
      key: this.$store.getters.userInfo.projectId,
      label: this.$store.getters.userInfo.project,
    }
    let initIsOpenBlockedResources = false
    let initBlockedResources = []
    if (this.cloneData) {
      const { tenant, tenant_id, skip_sync_resources = [] } = this.cloneData
      if (tenant || tenant_id) {
        initialProject = {
          key: tenant_id,
          label: tenant,
        }
      }
      if (skip_sync_resources.length > 0) {
        initIsOpenBlockedResources = true
        initBlockedResources = skip_sync_resources
      }
    }
    return {
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.handleValuesChange,
        }),
        fd: {
          domain: '',
          share_mode: 'account_domain',
        },
      },
      keySecretFieldInit: keySecretFields[this.provider.toLowerCase()],
      formLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 8 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
      domainProjectShow: false,
      decorators: {
        project: [
          'project',
          {
            initialValue: initialProject,
            rules: [
              { required: true, message: this.$t('rules.project') },
            ],
          },
        ],
        isOpenBlockedResources: [
          'isOpenBlockedResources',
          {
            initialValue: initIsOpenBlockedResources,
            valuePropName: 'checked',
          },
        ],
        blockedResources: [
          'blockedResources',
          {
            initialValue: initBlockedResources,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.block_resources_type')]) },
            ],
          },
        ],
      },
    }
  },
  computed: {
    keySecretField () {
      return keySecretFields[this.provider.toLowerCase()]
    },
    isAliyun () {
      return this.provider.toLowerCase() === 'aliyun'
    },
  },
  watch: {
    provider (val) {
      this.decorators = this.getDecorators()
    },
  },
  activated () { // 使 DomainProject 组件避免被缓存住
    this.domainProjectShow = true
  },
  deactivated () {
    this.domainProjectShow = false
    if (this.keepAliveFields) return
    this.form.fc.resetFields()
  },
  created () {
  },
  methods: {
    transformParams (params) {
      // 处理屏蔽同步资源
      if (params.isOpenBlockedResources) {
        params.skip_sync_resources = params.blockedResources
        delete params.isOpenBlockedResources
        delete params.blockedResources
      }
      // 针对oracle cloud oracle_private_pem参数做转换处理
      if (params.oracle_private_pem) {
        params.oracle_private_key = params.oracle_private_pem
        delete params.oracle_private_pem
      }
      if (this.provider === PROVIDER_MAP.VMware.key) {
        if (params.zone) {
          params.zone = params.zone?.key
          delete params.cloudregion
        }
      }
      if (this.provider === EXTRA_HYPERVISORS.CephFS.key) {
        if (params.mon_host || params.secret) {
          params.options = params.options || {}
          params.options.mon_host = params.mon_host
          params.options.password = params.secret
          delete params.mon_host
          delete params.secret
        }
      }
      return params
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) {
            reject(err)
          } else {
            const params = {}
            R.forEachObjIndexed((value, key) => {
              if (R.is(String, value)) {
                params[key] = value.trim()
              } else {
                params[key] = value
              }
            }, values)
            if (this.provider === 'Huawei' && !params.environment) {
              params.environment = 'ChinaCloud'
            }
            resolve(this.transformParams(params))
          }
        })
      })
    },
    project_change () {
      const proxySettingref = this.$refs.proxySetting
      if (proxySettingref && proxySettingref.fetchQueryProxy) {
        // 根据域获取代理列表信息
        proxySettingref.fetchQueryProxy()
      }
    },
    async handleValuesChange (vm, changedFields) {
      // await this.$nextTick()
      const fields = Object.keys(changedFields)
      if (changedFields && fields.length > 0) {
        fields.forEach(field => {
          this.$set(this.form.fd, field, changedFields[field])
          // this.form.fd[field] = changedFields[field]
          const fn = this[`${field}_change`]
          if (fn && typeof fn === 'function') {
            fn()
          }
        })
      }
    },

  },
}
