import { mapGetters } from 'vuex'
import * as R from 'ramda'
import _ from 'lodash'
import DomainProject from '@/sections/DomainProject'
import { isRequired } from '@/utils/validate'
import CloudproviderRegionZone from '@/sections/CloudproviderRegionZone'
import i18n from '@/locales'

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
              { required: true, message: i18n.t('network.text_283') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        cluster_id: [
          'cluster_id',
          {
            rules: [
              { required: true, message: i18n.t('network.text_79'), trigger: 'change' },
            ],
          },
        ],
        vpc: [
          'vpc',
          {
            rules: [
              { required: true, message: i18n.t('network.text_274'), trigger: 'change' },
            ],
          },
        ],
        network: [
          'network',
          {
            rules: [
              { required: true, message: i18n.t('network.text_284'), trigger: 'change' },
            ],
          },
        ],
        cloudprovider: [
          'cloudprovider',
          {
            initialValue: { key: '', label: '' },
            rules: [
              { validator: isRequired(), message: i18n.t('network.text_285') },
            ],
          },
        ],
        cloudregion: [
          'cloudregion',
          {
            initialValue: { key: '', label: '' },
            rules: [
              { validator: isRequired(), message: i18n.t('network.text_286') },
            ],
          },
        ],
        zone: [
          'zone',
          {
            initialValue: { key: '', label: '' },
            rules: [
              { validator: isRequired(), message: i18n.t('network.text_287') },
            ],
          },
        ],
        loadbalancer_spec: [
          'loadbalancer_spec',
          {
            rules: [
              { required: true, message: i18n.t('network.text_269') },
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
              { required: true, message: i18n.t('network.text_288'), trigger: 'change' },
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
              { required: true, message: i18n.t('network.text_278') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    scopeParams () {
      const params = {}
      if (this.isAdminMode) {
        if (!this.l3PermissionEnable) {
          params.project_domain = 'default'
        }
        if (R.is(String, this.domain)) {
          params.project_domain = this.domain
        }
      } else {
        params.scope = this.scope
      }
      return params
    },
    vpcParams () {
      if (this.form.fd.cloudprovider && this.form.fd.cloudprovider.key && !R.isEmpty(this.scopeParams)) {
        const params = { ...this.scopeParams, manager_id: this.form.fd.cloudprovider.key }
        if (_.get(this.form.fd, 'cloudregion.key')) {
          params.cloudregion = _.get(this.form.fd, 'cloudregion.key')
        }
        return params
      }
      return {}
    },
    networkParams () {
      let params = {}
      if (this.form.fd.vpc && !R.isEmpty(this.scopeParams)) {
        params = { ...this.scopeParams }
        params.limit = 0
        params.vpc = this.form.fd.vpc
        if (this.form.fd.zone && this.form.fd.zone.key) params.zone = this.form.fd.zone.key
      }
      return params
    },
    cloudregionParams () {
      const params = {
        limit: 0,
        provider: this.$route.query.type,
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
    zoneParams () {
      const params = {
        usable: true,
        order_by: 'created_at',
        order: 'asc',
        limit: 0,
        ...this.scopeParams,
      }
      return params
    },
  },
  methods: {
    validateIp () {
      const remainIps = this.networkObj.ports - this.networkObj.ports_used
      if (remainIps && remainIps < 8) {
        this.$message.warning(i18n.t('network.text_276'))
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
