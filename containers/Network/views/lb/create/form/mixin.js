import { mapGetters } from 'vuex'
import * as R from 'ramda'
import _ from 'lodash'
import DomainProject from '@/sections/DomainProject'
import { isRequired } from '@/utils/validate'
import CloudproviderRegionZone from '@/sections/CloudproviderRegionZone'
import i18n from '@/locales'
import Tag from '@/sections/Tag'

export default {
  components: {
    DomainProject,
    CloudproviderRegionZone,
    Tag,
  },
  props: {
    type: String,
  },
  data () {
    return {
      domain: {},
      project: {},
      vpcObj: {},
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
              { required: true, message: i18n.t('network.text_116') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: ['description'],
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
        manager: [
          'manager',
          {
            // initialValue: { key: '', label: '' },
            rules: [
              { required: true, message: i18n.t('network.text_285') },
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
              { validator: isRequired(), message: i18n.t('scope.text_65') },
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
        instance_type: [
          'instance_type',
          {
            initialValue: 'application',
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
              { required: true, message: i18n.t('network.text_288'), trigger: 'change', type: 'number' },
            ],
          },
        ],
        ip: [
          'ip',
          {
            initialValue: 'ipv4',
          },
        ],
        eip: {
          type: [
            'eip_type',
            {
              initialValue: 'none',
            },
          ],
          charge_type: [
            'eip_charge_type',
          ],
          bgp_type: [
            'eip_bgp_type',
            {
              initialValue: '',
            },
          ],
          bandwidth: [
            'eip_bw',
            {
              initialValue: 30,
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
        __meta__: [
          '__meta__',
          {
            rules: [
              { validator: this.$validate('tagName') },
            ],
          },
        ],
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    project () {
      return this.form.fd.project ? this.form.fd.project : this.$store.getters.userInfo.projectId
    },
    provider () {
      if (this.form.fd.provider) {
        return this.form.fd.provider.toLocaleLowerCase()
      }
      return null
    },
    isAliyun () {
      return this.provider === 'aliyun'
    },
    isAws () {
      return this.provider === 'aws'
    },
    isHuawei () {
      return this.provider === 'huawei'
    },
    isQcloud () {
      return this.provider === 'qcloud'
    },
    isShowCloudprovider () {
      const { address_type } = this.form.fd
      if (this.isAliyun) {
        return address_type === 'internet'
      }
      return false
    },
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
      const { cloudregion } = this.form.fd
      if (cloudregion && !R.isEmpty(this.scopeParams)) {
        const params = {
          ...this.scopeParams,
          cloudregion: _.isObject(cloudregion) ? cloudregion.key : cloudregion,
        }
        return params
      }
      return {}
    },
    networkParams () {
      let params = {}
      if (this.form.fd.vpc && !R.isEmpty(this.scopeParams)) {
        params = { ...this.scopeParams, usable: true }
        params.limit = 0
        params.vpc = this.form.fd.vpc
        if (this.form.fd.zone) params.zone = this.form.fd.zone
      }
      return params
    },
    cloudregionParams () {
      const params = {
        limit: 0,
        capability: undefined,
        cloud_env: this.type,
        ...this.scopeParams,
      }
      if (this.type === 'private') {
        params['filter.0'] = 'provider.in(OpenStack,HCSO)'
      } else {
        delete params.provider
      }
      return params
    },
    cloudproviderParams () {
      if (R.isEmpty(this.scopeParams)) return {}
      const { provider } = this.form.fd
      const params = {
        limit: 0,
        enabled: true,
        provider,
        status: 'connected',
        cloudregion: this.form.fd.cloudregion,
        ...this.scopeParams,
      }
      return params
    },
    zoneParams () {
      const params = {
        usable: true,
        show_emulated: true,
        order_by: 'created_at',
        order: 'asc',
        limit: 0,
        ...this.scopeParams,
      }
      return params
    },
    cityParams () {
      const params = {
        ...this.scopeParams,
      }
      if (this.type === 'public') params.public_cloud = true
      return params
    },
    areaParams () {
      return {
        cityParams: this.cityParams,
        providerParams: this.scopeParams,
        cloudregionParams: this.cloudregionParams,
        zoneParams: this.zoneParams,
        isRequired: true,
        ...this.formItemLayout,
        event: {
          providerFetchSuccess: (list) => {
            return list
          },
        },
      }
    },
  },
  methods: {
    vpcLabelFormat (item) {
      if (!item.cidr_block) return item.name
      return `${item.name}（${item.account ? item.account + ', ' : ''}${item.cidr_block}）`
    },
    vpcFormatter (v) {
      return {
        key: v.id,
        label: this.vpcLabelFormat(v),
        rightLabel: v.manager ? this.$t('network.manager', [v.manager]) : '',
        disabled: v.network_count === 0,
        ...v,
      }
    },
    handleVpcChange (data) {
      this.vpcObj = data[0] ? data[0] : {}
    },
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
