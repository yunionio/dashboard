import { mapGetters } from 'vuex'
import * as R from 'ramda'
import DomainProject from '@/sections/DomainProject'
import { isRequired } from '@/utils/validate'
import CloudproviderRegionZone from '@/sections/CloudproviderRegionZone'

export default {
  components: {
    DomainProject,
    CloudproviderRegionZone,
  },
  data () {
    return {
      domain: {},
      project: {},
      networkObj: {},
      zoneParams: {
        // usable: true,
        // show_emulated: true,
        // order_by: 'created_at',
        // order: 'asc',
      },
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          address_type: 'internet',
          charge_type: 'traffic',
          bandwidth: 1,
          ip: 'ipv4',
        },
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      decorators: {
        domain: [
          'domain',
          {
            initialValue: this.$store.getters.userInfo.projectDomainId,
            rules: [
              { required: true, message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: this.$store.getters.userInfo.projectId,
            rules: [
              { required: true, message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入主机名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        cluster_id: [
          'cluster_id',
          {
            rules: [
              { required: true, message: '请选择集群', trigger: 'change' },
            ],
          },
        ],
        vpc: [
          'vpc',
          {
            rules: [
              { required: true, message: '请选择专有网络', trigger: 'change' },
            ],
          },
        ],
        network: [
          'network',
          {
            rules: [
              { required: true, message: '请选择网络', trigger: 'change' },
            ],
          },
        ],
        cloudprovider: [
          'cloudprovider',
          {
            initialValue: { key: '', label: '' },
            rules: [
              { validator: isRequired(), message: '请选择账号' },
            ],
          },
        ],
        cloudregion: [
          'cloudregion',
          {
            initialValue: { key: '', label: '' },
            rules: [
              { validator: isRequired(), message: '请选择区域' },
            ],
          },
        ],
        zone: [
          'zone',
          {
            initialValue: { key: '', label: '' },
            rules: [
              { validator: isRequired(), message: '请选择可用区' },
            ],
          },
        ],
        loadbalancer_spec: [
          'loadbalancer_spec',
          {
            rules: [
              { required: true, message: '请选择规格' },
            ],
          },
        ],
        address_type: [
          'address_type',
          {
            initialValue: 'internet',
          },
        ],
        chargeType: [
          'charge_type',
          {
            initialValue: 'traffic',
          },
        ],
        bandwidth: [
          'bandwidth',
          {
            initialValue: 1,
            rules: [
              { required: true, message: '请输入带宽', trigger: 'change' },
            ],
          },
        ],
        ip: [
          'ip',
          {
            initialValue: 'ipv4',
          },
        ],
        eip: [
          'eip',
          {
            rules: [
              { required: true, message: '请选择弹性公网IP' },
            ],
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo']),
    scopeParams () {
      const params = {}
      if (this.isAdminMode) {
        if (R.is(String, this.domain)) {
          params['project_domain'] = this.domain
        }
      } else {
        params.scope = this.scope
      }
      return params
    },
    vpcParams () {
      if (this.form.fd.cloudprovider && this.form.fd.cloudprovider.key && !R.isEmpty(this.scopeParams)) {
        return { ...this.scopeParams, manager_id: this.form.fd.cloudprovider.key }
      }
      return {}
    },
    networkParams () {
      let params = {}
      if (this.form.fd.vpc && !R.isEmpty(this.scopeParams)) {
        params = { ...this.scopeParams }
        params.limit = 0
        params.vpc = this.form.fd.vpc
      }
      return params
    },
    cloudregionParams () {
      const params = {
        limit: 0,
        ...this.scopeParams,
      }
      return params
    },
    cloudproviderParams () {
      if (R.isEmpty(this.scopeParams)) return {}
      const params = {
        limit: 0,
        enabled: true,
        provider: this.$route.query.type,
        status: 'connected',
        ...this.scopeParams,
      }
      return params
    },
  },
  methods: {
    validateIp () {
      const remainIps = this.networkObj.ports - this.networkObj.ports_used
      if (remainIps && remainIps < 8) {
        this.$message.warning('指定的IP子网必须有大于或等于8个的可用IP才可以被选择创建实例')
        return false
      }
      return true
    },
    onValuesChange (props, values) {
      R.forEachObjIndexed((value, key) => {
        this.$set(this.form.fd, key, value)
      }, values)
    },
  },
}
