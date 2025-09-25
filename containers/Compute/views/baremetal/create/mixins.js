import * as R from 'ramda'
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { LOGIN_TYPES_MAP, NETWORK_OPTIONS_MAP, FORECAST_FILTERS_MAP } from '@Compute/constants'
import OsSelect from '@Compute/sections/OsSelect'
import ServerPassword from '@Compute/sections/ServerPassword'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import SchedPolicy from '@Compute/sections/SchedPolicy'
import DomainProject from '@/sections/DomainProject'
import CloudregionZone from '@/sections/CloudregionZone'
import Tag from '@/sections/Tag'
import validateForm, { isRequired, isWithinRange } from '@/utils/validate'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { sizestr } from '@/utils/utils'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import i18n from '@/locales'
import { checkIpV6, getIpv6Start } from '@Compute/utils/createServer'
import BottomBar from './BottomBar'

function checkIpInSegment (i, networkData) {
  return (rule, value, cb) => {
    const isIn = isWithinRange(value, networkData.guest_ip_start, networkData.guest_ip_end)
    if (isIn) {
      cb()
    } else {
      cb(new Error(i18n.t('compute.text_205')))
    }
  }
}

export default {
  props: {
    cloudEnv: {
      type: String,
      required: true,
    },
    initFormData: {
      type: Object,
      default: () => ({}),
    },
    isInitForm: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    BottomBar,
    CloudregionZone,
    OsSelect,
    ServerPassword,
    ServerNetwork,
    SchedPolicy,
    DomainProject,
    Tag,
  },
  data () {
    const initData = this.isInitForm && this.initFormData
    const imageTypeInitValue = initData.extraData?.image_type || IMAGES_TYPE_MAP.standard.key
    let initImage = ''
    if (initData.disks) {
      initData.disks.forEach(item => {
        if (item.image_id) {
          initImage = item.image_id
        }
      })
    }
    if (initData.extraData?.image) {
      initImage = initData.extraData.image
    }
    let initLoginType = 'random'
    if (initData.keypair) {
      initLoginType = 'keypair'
    }
    if (initData.hasOwnProperty('reset_password') && !initData.reset_password) {
      initLoginType = 'image'
    }
    if (initData.hasOwnProperty('password') && initData.password) {
      initLoginType = 'password'
    }
    let initNetworkType = NETWORK_OPTIONS_MAP.default.key
    let initBonding = false
    if (initData.nets) {
      if (initData.nets[0] && initData.nets[0].hasOwnProperty('exit') && !initData.nets[0].exit) {
        if (initData.nets[0].require_teaming) {
          initBonding = true
        }
        initNetworkType = NETWORK_OPTIONS_MAP.default.key
      } else if (initData.nets[0] && initData.nets[0].hasOwnProperty('network') && initData.extraData?.extraNets && initData.extraData?.extraNets[0] && initData.extraData?.extraNets[0].hasOwnProperty('network')) {
        initNetworkType = NETWORK_OPTIONS_MAP.manual.key
        if (initData.nets[0].require_teaming) {
          initBonding = true
        }
      } else {
        initNetworkType = NETWORK_OPTIONS_MAP.schedtag.key
        if (initData.nets[0].schedtags && initData.nets[0].schedtags.length && initData.nets[0].schedtags[0].require_teaming) {
          initBonding = true
        }
      }
    }
    let initSchedPolicyType = 'default'
    if (initData.prefer_host) {
      initSchedPolicyType = 'host'
    }
    if (initData.schedtags && initData.schedtags.length) {
      initSchedPolicyType = 'schedtag'
    }
    return {
      submiting: false,
      errors: {},
      formItemLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 2 },
        },
      },
      offsetFormItemLayout: {
        wrapperCol: {
          md: { span: 18, offset: 6 },
          xl: { span: 20, offset: 4 },
          xxl: { span: 22, offset: 2 },
        },
      },
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            this.$bus.$emit('updateForm', values)
            if (values.hasOwnProperty('cloudregion') && values.cloudregion.key) {
              this.cloudregion = values.cloudregion.key
            }
            if (values.hasOwnProperty('zone') && values.zone.key) {
              this.capability(values.zone.key)
              this.zone = values.zone.key
            }
            if (values.hasOwnProperty('imageType')) {
              if (values.imageType === 'iso') {
                this.capability(this.zone, true)
              } else {
                this.capability(this.zone)
              }
            }
            if (values.domain) {
              this.project_domain = values.domain.key
              this.params.region = {
                ...this.params.region,
                project_domain: values.domain.key,
              }
            }
          },
        }),
        fi: {
          capability: {},
          imageMsg: {},
          networkList: [],
          createType: 'baremetal',
        },
      },
      decorators: {
        domain: [
          'domain',
          {
            initialValue: initData.extraData?.domain_id || this.$route.query.domain_id || '',
            rules: [
              { validator: isRequired(), message: i18n.t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: initData.project_id || '',
            rules: [
              { validator: isRequired(), message: i18n.t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            initialValue: initData.generate_name || '',
            validateTrigger: 'blur',
            validateFirst: true,
            rules: [
              { required: true, message: i18n.t('compute.text_210') },
              { validator: this.$validate('resourceCreateName') },
            ],
          },
        ],
        regionZone: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: initData.prefer_region || '', label: '' },
              rules: [
                { required: true, message: i18n.t('compute.text_212') },
              ],
            },
          ],
          zone: [
            'zone',
            {
              initialValue: { key: initData.prefer_zone || '', label: '' },
              rules: [
                { required: true, message: i18n.t('compute.text_213') },
              ],
            },
          ],
        },
        count: [
          'count',
          {
            initialValue: initData.count || 1,
          },
        ],
        imageOS: {
          os: [
            'os',
            {
              initialValue: initData.extraData?.os || '',
              rules: [
                { required: true, message: i18n.t('compute.text_153') },
              ],
            },
          ],
          image: [
            'image',
            {
              initialValue: { key: initImage || '', label: '' },
              rules: [
                { validator: isRequired(), message: i18n.t('compute.text_214') },
              ],
            },
          ],
          imageType: [
            'imageType',
            {
              initialValue: imageTypeInitValue,
            },
          ],
        },
        specifications: [
          'specifications',
          {
            initialValue: initData.extraData?.specifications || '',
            rules: [
              { required: true, message: i18n.t('compute.text_313') },
            ],
          },
        ],
        loginConfig: {
          loginType: [
            'loginType',
            {
              initialValue: initLoginType,
            },
          ],
          keypair: [
            'loginKeypair',
            {
              initialValue: initData.keypair || '',
              rules: [
                { required: true, message: i18n.t('compute.text_203') },
              ],
            },
          ],
          password: [
            'loginPassword',
            {
              initialValue: initData.password || '',
              validateFirst: true,
              rules: [
                { required: true, message: i18n.t('compute.text_204') },
                { validator: validateForm('sshPassword') },
              ],
            },
          ],
        },
        network: {
          networkType: [
            'networkType',
            {
              initialValue: initNetworkType,
            },
          ],
          networkConfig: {
            vpcs: i => [
              `vpcs[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: i18n.t('compute.text_194'),
                }],
              },
            ],
            networks: i => [
              `networks[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: i18n.t('compute.text_217'),
                }],
              },
            ],
            ips: (i, networkData) => [
              `networkIps[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_218'),
                }, {
                  validator: checkIpInSegment(i, networkData),
                }],
              },
            ],
            ips6: (i, networkData) => [
              `networkIpsAddress6[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    required: true,
                    message: this.$t('compute.complete_ipv6_address'),
                  },
                  {
                    validator: checkIpV6(i, networkData),
                  },
                ],
              },
            ],
            ipv6_mode: (i, networkData) => [
              `networkIPv6Modes[${i}]`,
              {
                initialValue: 'all',
              },
            ],
            ipv6s: (i, networkData) => [
              `networkIPv6s[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
              },
            ],
          },
          networkSchedtag: {
            schedtags: i => [
              `networkSchedtags[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: i18n.t('compute.text_123'),
                }],
              },
            ],
            policys: (i, networkData) => [
              `networkPolicys[${i}]`,
              {
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: i18n.t('compute.text_123'),
                }],
              },
            ],
          },
        },
        schedPolicy: {
          schedPolicyType: [
            'schedPolicyType',
            {
              initialValue: initSchedPolicyType,
            },
          ],
          schedPolicyHost: [
            'schedPolicyHost',
            {
              initialValue: initData.prefer_host,
              rules: [
                { required: true, message: i18n.t('compute.text_314') },
              ],
            },
          ],
          policySchedtag: {
            schedtags: i => [
              `policySchedtagSchedtags[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: i18n.t('compute.text_123'),
                }],
              },
            ],
            policys: (i, networkData) => [
              `policySchedtagPolicys[${i}]`,
              {
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: i18n.t('compute.text_123'),
                }],
              },
            ],
          },
        },
        description: [
          'description',
        ],
        __meta__: [
          '__meta__',
          {
            initialValue: initData.__meta__ || {},
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
      },
      zone: '',
      cloudregion: '',
      params: {
        zone: {},
        region: {
          usable: true,
          is_on_premise: true,
          scope: this.$store.getters.scope,
        },
        policySchedtag: {
          limit: 1024,
          'filter.0': 'resource_type.equals(hosts)',
          scope: this.$store.getters.scope,
        },
        policyHostParams: {
          enabled: 1,
          usable: true,
          is_empty: true,
          host_type: 'baremetal',
          scope: this.$store.getters.scope,
        },
        vpcParams: {
          usable: true,
          scope: this.$store.getters.scope,
          // limit: 0,
          // show_emulated: true,
          filter: 'id.equals("default")',
        },
      },
      selectedImage: {},
      specOptions: [],
      selectedSpecItem: {},
      resourceType: 'shared',
      policyHostDisabled: [],
      diskData: {},
      diskOptionsDate: [],
      chartSettings: {
        limitShowNum: 5,
        radius: 50,
        selectedMode: 'single',
        labelLine: {
          normal: {
            show: true,
          },
        },
        label: {
          position: 'inside',
        },
        itemStyle: {
          color: function (params) {
            const colorList = ['#afa3f5', '#00d488', '#3feed4', '#3bafff', '#f1bb4c', 'rgba(250,250,250,0.5)']
            if (params.data.name === i18n.t('compute.text_315')) {
              return '#e3e3e3'
            } else {
              return colorList[params.dataIndex]
            }
          },
        },
        offsetY: 100,
        dataType: function (v) {
          return v + ' G'
        },
      },
      isBonding: initBonding,
      isShowFalseIcon: false,
      count: 1,
      hostData: [],
      filterHostData: [],
      isSupportIso: false,
      project_domain: '',
      projectId: '',
      domainId: '',
      osSelectImageType: 'standard',
      wires: [],
      tagDefaultChecked: {},
    }
  },
  computed: {
    ...mapGetters([
      'isAdminMode',
      'scope',
      'isDomainMode',
    ]),
    routerQuery () {
      return this.$route.query
    },
    imageParams () {
      return {
        status: 'active',
        details: true,
        limit: 0,
        'filter.0': 'disk_format.notequals(iso)',
        scope: this.$store.getters.scope,
        is_standard: true,
      }
    },
    networkParam () {
      let ret = {
        zone: this.zone,
        usable: true,
      }
      if (this.isInstallOperationSystem) {
        if (this.$route.query.wire_id) ret.filter = `wire_id.in(${this.$route.query.wire_id})`
        ret = {
          ...ret,
          scope: this.$store.getters.scope,
          host: this.$route.query.host_id,
        }
        return ret
      } else {
        ret = {
          ...ret,
          ...this.scopeParams,
        }
      }
      if (!R.isEmpty(this.wires)) {
        ret.filter = `wire_id.in(${this.wires.join(',')})`
      }
      return ret
    },
    vpcResource () {
      if (this.isInstallOperationSystem) {
        return 'vpcs'
      }
      return `cloudregions/${this.cloudregion}/vpcs`
    },
    scopeParams () {
      if (this.isDomainMode) {
        return {
          scope: this.scope,
        }
      }
      return { project_domain: this.project_domain || this.projectId }
    },
    hasMeterService () { // 是否有计费的服务
      const { services } = this.$store.getters.userInfo
      const meterService = services.find(val => val.type === 'meter')
      if (meterService && meterService.status === true) {
        return true
      }
      return false
    },
    isInstallOperationSystem () { // 是否是安装操作系统
      if (this.$route.query.host_id) {
        return true
      }
      return false
    },
    osSelectTypes () {
      const types = ['standard', 'customize']
      if (this.isInstallOperationSystem && this.isSupportIso) {
        types.push('iso')
      }
      if (!this.isInstallOperationSystem) {
        types.push('iso')
      }
      return types
    },
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_MACHINE)
    },
    isCheckedIso () {
      return this.osSelectImageType === 'iso'
    },
    isWindows () {
      let isWindows = false
      if (this.selectedImage.os && this.form.fd.os.toLowerCase() === 'windows') {
        isWindows = true
      }
      return isWindows
    },
    loginTypes () { // 主机模板隐藏手工输入密码
      const maps = R.clone(LOGIN_TYPES_MAP)
      if (this.isWindows) {
        delete maps.keypair
      }
      const loginTypes = Object.keys(maps)
      return loginTypes
    },
  },
  provide () {
    return {
      form: this.form,
      fi: this.form.fi,
    }
  },
  watch: {
    diskOptionsDate: {
      handler (val) {
        let isDistribution = false
        let isDiff = false // 是否存在不通的raid盘
        for (var i = 0; i < this.diskOptionsDate.length; i++) {
          // 每一项是否有分配磁盘
          if (i > 0) {
            const rowsLength = this.diskOptionsDate[i].chartData.rows.length
            if ((rowsLength === 1 && this.diskOptionsDate[i].chartData.rows[0].name !== i18n.t('compute.text_315')) || (rowsLength > 1)) {
              isDistribution = true
            }
          }
          if (this.diskOptionsDate[0].diskInfo[1] !== this.diskOptionsDate[i].diskInfo[1]) {
            isDiff = true
          }
          if (isDiff && this.diskOptionsDate[0].remainder > 0 && isDistribution) {
            this.isShowFalseIcon = true
          } else {
            this.isShowFalseIcon = false
          }
        }
      },
      deep: true,
    },
    project_domain (newVal, oldVal) {
      if (this.isInstallOperationSystem) this.fetchSpec()
      this.capability(this.zone)
    },
  },
  created () {
    this.zonesM2 = new this.$Manager('zones')
    this.serverM = new this.$Manager('servers')
    this.schedulerM = new this.$Manager('schedulers', 'v1')
    this.fetchSpec = _.debounce(this._fetchSpec, 500)
    if (this.$route.query.id) {
      this.fetchSpec()
      this.hostDetail()
    }
    if (this.$route.query.zone_id) {
      this.zone = this.$route.query.zone_id
      this.capability(this.$route.query.zone_id)
    }
    if (this.scope !== 'project') {
      this.loadHostOpt()
    }
  },
  mounted () {
    this.initForm()
  },
  methods: {
    async getCapability (v, data) { // 可用区查询
      const params = {
        show_emulated: true,
        resource_type: this.resourceType,
        host_type: 'baremetal',
        ...this.scopeParams,
        $t: 1,
      }
      if (this.$store.getters.isAdminMode) {
        params.project_domain = data?.extraData?.domain_id
      }
      return this.zonesM2.get({ id: `${v}/capability`, params })
    },
    async initForm () {
      const initData = this.initFormData
      let cData = {}
      if (this.isInitForm && initData.extraData && this.form?.fc) {
        try {
          const { data: capabilityData } = await this.getCapability(initData.prefer_zone, initData)
          this.form.fi.capability = capabilityData
          cData = capabilityData
        } catch (error) {
          throw error
        }
        this.$nextTick(() => {
          // 初始化磁盘
          if (initData.baremetal_disk_configs && initData.baremetal_disk_configs.length) {
            let diskData = null
            if (initData.extraData?.specifications && cData?.specs?.hosts) {
              const keys = Object.keys(cData.specs.hosts)
              for (const key of keys) {
                if (key.replace(/model:.+\//, '') === initData.extraData?.specifications) {
                  diskData = cData.specs.hosts[key].disk
                }
              }
            }
            if (diskData) {
              initData.baremetal_disk_configs.forEach(item => {
                const key = `${item.driver}.adapter${item.adapter}`
                const info = _.get(diskData, key) || []
                if (info.length) {
                  const opt1 = `${info[0].type}:${sizestr(info[0].size, 'M', 1024)}`
                  this.addDiskCallBack({
                    computeCount: item.count, // TODO
                    count: item.count,
                    start_index: item.range[0],
                    end_index: info[0].index,
                    option: [`${item.driver}:adapter${item.adapter}`, opt1, item.conf],
                  })
                }
              })
            }
          }
          // 初始化网络
          if (this.$refs.networkRef && initData.nets) {
            let initNetworkType = NETWORK_OPTIONS_MAP.default.key
            if (initData.nets[0] && initData.nets[0].hasOwnProperty('exit') && !initData.nets[0].exit) {
              initNetworkType = NETWORK_OPTIONS_MAP.default.key
            } else if (initData.nets[0] && initData.nets[0].hasOwnProperty('network') && initData.extraData?.extraNets && initData.extraData?.extraNets[0] && initData.extraData?.extraNets[0].hasOwnProperty('network')) {
              initNetworkType = NETWORK_OPTIONS_MAP.manual.key
            } else {
              initNetworkType = NETWORK_OPTIONS_MAP.schedtag.key
            }
            this.form.fc.setFieldsValue({
              networkType: initNetworkType,
            })
            this.$refs.networkRef.change({ target: { value: initNetworkType }, name: 'default' })
            if (initNetworkType === NETWORK_OPTIONS_MAP.manual.key) {
              this.$nextTick(() => {
                if (this.$refs.networkRef.$refs.networkConfigRef) {
                  this.$refs.networkRef.$refs.networkConfigRef.initData(initData.extraData.extraNets)
                }
              })
            }
            if (initNetworkType === NETWORK_OPTIONS_MAP.schedtag.key) {
              this.$nextTick(() => {
                if (this.$refs.networkRef.$refs.networkSchedtagRef) {
                  this.$refs.networkRef.$refs.networkSchedtagRef.initData(initData.nets)
                }
              })
            }
          }
          // 高级配置
          this.$nextTick(() => {
            // 调度策略
            if (this.$refs.schedPolicyRef) {
              if (initData.prefer_host) {
                this.$refs.schedPolicyRef.change({ target: { value: 'host' }, name: 'default' })
              }
              if (initData.schedtags && initData.schedtags.length) {
                this.$refs.schedPolicyRef.change({ target: { value: 'schedtag' }, name: 'default' })
                setTimeout(() => {
                  if (this.$refs.schedPolicyRef.$refs.policySchedtagRef) {
                    this.$refs.schedPolicyRef.$refs.policySchedtagRef.initData(initData.schedtags)
                  }
                }, 1000)
              }
            }
          })
          // 初始化标签
          if (initData.__meta__) {
            const ret = {}
            R.forEachObjIndexed((value, key) => {
              ret[key] = R.is(Array, value) ? value : [value]
            }, initData.__meta__)
            this.tagDefaultChecked = ret
          }
        })
      }
    },
    vpcResourceMapper (list) {
      return list.filter(val => val.id === 'default')
    },
    setSelectedImage ({ imageMsg }) {
      this.selectedImage = imageMsg
    },
    // 过滤network数据
    networkResourceMapper (data) {
      data = data.filter((d) => d.server_type !== 'ipmi' && d.server_type !== 'pxe')
      return data
    },
    // 指定物理机改变
    hostChange (e) {
      this.hostDetail(e)
    },
    // 规格变动
    specificationChange (value) {
      const str = value.replace(/\//g, ',')
      const arr = str.split(',')
      const obj = {}
      for (var i = 0; i < arr.length; i++) {
        const arr2 = arr[i].split(':')
        obj[arr2[0]] = arr2[1]
      }
      this.selectedSpecItem = obj
      const currentSpec = this.form.fi.capability.specs.hosts[value]
      if (R.has('isolated_devices')(currentSpec)) {
        this.selectedSpecItem.isolated_devices = currentSpec.isolated_devices
      }
      this.diskData = this.form.fi.capability.specs.hosts[value].disk
      // 过滤包含此规格的物理机
      this.hostResourceMapper(this.hostData)
      // 获取此规格的包含的wire
      this.getSpecWire(value)
      // 规格变动清空历史硬盘配置
      this.diskOptionsDate = []
    },
    // 获取物理机数据
    loadHostOpt () {
      const manager = new this.$Manager('hosts')
      const params = { ...this.params.policyHostParams }
      manager.list({ params })
        .then(({ data: { data = [] } }) => {
          this.hostData = data
          this.filterHostData = data
        })
        .catch((error) => {
          throw error
        })
    },
    // 如果是安装操作系统--查询物理机详情
    hostDetail (hostId) {
      const hostManager = new this.$Manager('hosts')
      hostManager.get({ id: this.$route.query.id || hostId })
        .then(({ data }) => {
          if (data.ipmi_info && data.ipmi_info.cdrom_boot) {
            this.isSupportIso = true
          } else {
            this.isSupportIso = false
          }
        })
    },
    // 如果有指定物理机的情况下过滤物理机数据
    hostResourceMapper (data) {
      this.filterHostData = data.filter((d) => R.equals(d.spec.disk, this.diskData))
    },
    // 安装操作系统下获取规格
    _fetchSpec () {
      const manager = new this.$Manager('specs')
      const params = { host_type: 'baremetal', filter: `id.equals(${this.$route.query.id})`, ...this.scopeParams }
      manager.rpc({ methodname: 'GetHostSpecs', params }).then(res => {
        const specs = res.data
        this.$set(this.form.fi.capability, 'specs', {
          hosts: specs,
        })
        if (!R.isNil(specs) && !R.isEmpty(specs)) {
          this._loadSpecificationOptions(specs)
        } else {
          this.specOptions = []
          // 清空选中规格
          this.$nextTick(() => {
            this.form.fc.setFieldsValue({ specifications: '' })
          })
        }
      })
    },
    capability (v, isIso = false) { // 可用区查询
      const data = {
        show_emulated: true,
        resource_type: this.resourceType,
        host_type: 'baremetal',
        ...this.scopeParams,
      }
      if (isIso) {
        data.cdrom_boot = true
      }
      // init 虚拟化平台并默认选择第一项
      this.zonesM2.get({
        id: `${v}/capability`,
        params: data,
      }).then(({ data = {} }) => {
        data.hypervisors = Array.from(new Set(data.hypervisors))
        const specs = data.specs.hosts
        // 如果是安装操作系统，只需要拿取public_network_count
        if (this.isInstallOperationSystem) {
          this.form.fi.capability = {
            ...this.form.fi.capability,
            public_network_count: data.public_network_count,
            auto_alloc_network_count: data.auto_alloc_network_count,
          }
        } else {
          this.form.fi.capability = {
            ...data,
          }
          if (!R.isNil(specs) && !R.isEmpty(specs)) {
            this._loadSpecificationOptions(specs)
          } else {
            this.specOptions = []
            // 清空选中规格
            this.$nextTick(() => {
              this.form.fc.setFieldsValue({ specifications: '' })
            })
          }
        }
      })
    },
    _loadSpecificationOptions (data) {
      const specs = {}
      let entries = Object.entries(data)
      entries = entries.map(item => {
        const newKey = item[0].replace(/model:.+\//, '')
        return [newKey, item[1]]
      })
      entries.forEach(item => {
        specs[item[0]] = item[1]
      })
      const options = []
      for (const k in specs) {
        const spec = {
          text: this.__getSpecification(specs[k]),
          value: k,
        }
        options.push(spec)
      }
      this.form.fi.capability.specs.hosts = specs
      this.specOptions = this.__ignoreModel(options)
      if (this.specOptions && this.specOptions.length) {
        // 规格默认选中第一项
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ specifications: this.specOptions[0].value })
        })
        // 存储选中规格中的信息
        this.diskData = this.form.fi.capability.specs.hosts[this.specOptions[0].value].disk
        this.hostResourceMapper(this.hostData)
        // 根据规格读取wire数据
        this.getSpecWire(this.specOptions[0].value)
        const originalValue = this.specOptions[0].value
        const str = this.specOptions[0].value.replace(/\//g, ',')
        const arr = str.split(',')
        const obj = {}
        for (var i = 0; i < arr.length; i++) {
          const arr2 = arr[i].split(':')
          obj[arr2[0]] = arr2[1]
        }
        obj.value = originalValue
        this.selectedSpecItem = obj
        const currentSpec = this.form.fi.capability.specs.hosts[originalValue]
        if (R.has('isolated_devices')(currentSpec)) {
          this.selectedSpecItem.isolated_devices = currentSpec.isolated_devices
        }
      }
    },
    __getSpecification (spec) {
      const cpu = spec.cpu
      const mem = sizestr(spec.mem, 'M', 1024)
      // 按类型和容量归并磁盘信息
      const disksObj = {}
      _.forEach(spec.disk, function (adapters, driver) {
        _.forEach(adapters, function (disks, adapter) {
          _.forEach(disks, function (disk) {
            disksObj[disk.type] = disksObj[disk.type] || {}
            disksObj[disk.type][disk.size] = disksObj[disk.type][disk.size] || 0
            disksObj[disk.type][disk.size] += disk.count
          })
        })
      })
      // disk string
      let disks = ''
      _.forEach(disksObj, function (caps, d) {
        disks += '_' + d
        const sizes = []
        _.forEach(caps, function (num, cap) {
          sizes.push(sizestr(cap, 'M', 1024) + 'x' + num)
        })
        disks += sizes.join('_')
      })
      // isolated_devices 根据 model 去重并添加count字段
      if (spec.isolated_devices && spec.isolated_devices.length > 0) {
        const gpuList = R.clone(spec.isolated_devices)
        for (let i = 0; i < gpuList.length; i++) {
          gpuList[i].count = 1
          for (let j = i + 1; j < gpuList.length; j++) {
            if (gpuList[i].model === gpuList[j].model) {
              gpuList[i].count++
              gpuList.splice(j, 1)
            }
          }
        }
        // gpu string
        let gpuString = '_'
        gpuList.map(item => {
          gpuString += `${item.model}X${item.count}、`
        })
        gpuString = gpuString.substr(0, gpuString.length - 1)
        return `${cpu}C${mem}${disks}${gpuString}`
      }
      return `${cpu}C${mem}${disks}`
    },
    __ignoreModel (options) {
      options = options.map(item => {
        return {
          text: item.text,
          value: item.value.replace(/model:.+\//, ''),
        }
      })
      return this.uniqueArr(options, 'value')
    },
    uniqueArr (arr, field) {
      if (field) {
        const obj = {}
        arr.forEach(item => {
          if (!obj[item[field]]) {
            obj[item[field]] = item
          }
        })
        const newArr = Object.values(obj)
        return Array.from(new Set(newArr))
      } else {
        return Array.from(new Set(arr))
      }
    },
    // 添加硬盘配置
    addDisk () {
      this.createDialog('BaremetalCreateDiskDialog', {
        title: i18n.t('compute.perform_create'),
        list: this.list,
        diskData: this.diskData,
        diskOptionsDate: this.diskOptionsDate,
        updateData: (data) => {
          this.addDiskCallBack(data)
        },
      })
    },
    _isNoneRaid (raidOpt) {
      return raidOpt === 'none'
    },
    // 添加硬盘配置后的回调
    addDiskCallBack (data) {
      let arr = []
      // data.option format: `["HPSARaid:adapter0", "HDD:279G", "raid10"]`
      data.option.forEach(item => {
        arr = arr.concat(item.split(':'))
      })
      // arr format: `["HPSARaid", "adapter0", "HDD", "279G", "raid10"]`
      const raidOpt = data.option[2]
      const raidType = arr[0]
      const adapter = arr[1]
      const diskType = arr[2]
      const diskSize = arr[3]

      let range = []
      let k = data.start_index
      if (this._isNoneRaid(raidOpt)) {
        range = [data.start_index]
      } else {
        while (k < data.start_index + data.count) {
          range.push(k)
          k++
        }
      }

      let sizeNumber = 0
      let n = 0
      if (diskSize.substr(diskSize.length - 1, 1) === 'T') {
        n = Number(diskSize.substr(0, diskSize.length - 1)) * 1024
      } else {
        n = Number(diskSize.substr(0, diskSize.length - 1))
      }
      if (this._isNoneRaid(raidOpt)) {
        sizeNumber = n
      } else {
        sizeNumber = this.raidUtil(n, raidOpt, data.count)
      }
      const option = {
        title: diskSize + ' ' + diskType + ' X ' + `${raidOpt === 'none' ? 1 : data.count}`,
        size: sizestr(sizeNumber, 'G', 1024),
        unitSize: sizestr(n, 'G', 1024),
        chartData: {
          columns: ['name', 'size'],
          rows: [],
        },
        diskInfo: [raidType, adapter, raidOpt],
        count: this._isNoneRaid(raidOpt) ? 1 : data.count,
        type: diskType,
        range,
      }
      if (this.diskOptionsDate.length === 0) {
        const defaultSize = 30
        const imageDiskSize = this.selectedImage.min_disk / 1024
        if (imageDiskSize >= defaultSize) {
          sizeNumber = sizeNumber - imageDiskSize
          option.chartData.rows.push({ name: i18n.t('compute.text_316'), size: imageDiskSize })
        } else {
          sizeNumber = sizeNumber - defaultSize
          option.chartData.rows.push({ name: '/', size: defaultSize })
        }
      }
      option.remainder = sizeNumber
      option.chartData.rows.push({ name: i18n.t('compute.text_315'), size: sizeNumber })
      this.diskOptionsDate.push(option)
      data.computeCount--
      if (this._isNoneRaid(raidOpt) && data.computeCount > 0) {
        data.start_index += 1
        this.addDiskCallBack(data)
      }
    },
    handleDiskItemRemove (idx) {
      this.diskOptionsDate.splice(idx, 1)
    },
    chartFun (idx) {
      return {
        click: (e, index) => this.handleChartEvents(e, idx),
      }
    },
    handleChartEvents (e, idx) {
      const selectedArea = this.diskOptionsDate[idx].chartData.rows.filter(item => item.name === e.name)
      let nameArr = []
      this.diskOptionsDate.forEach(item => {
        nameArr = nameArr.concat(item.chartData.rows)
      })
      nameArr = nameArr.filter(item => item.name !== i18n.t('compute.text_315'))
      this.createDialog('DiskOptionsUpdateDialog', {
        title: e.name === i18n.t('compute.text_315') ? i18n.t('compute.text_317') : i18n.t('compute.text_318'),
        list: this.list,
        item: this.diskOptionsDate[idx],
        nameArr,
        selectedArea: selectedArea[0],
        updateData: (values) => {
          const updateItem = this.diskOptionsDate[idx].chartData.rows
          if (e.name === i18n.t('compute.text_315')) {
            // 创建新分区
            updateItem.unshift({ name: values.name, size: values.size, format: values.format })
            if (values.size === this.diskOptionsDate[idx].remainder || values.method === 'autoextend') {
              this.diskOptionsDate[idx].remainder = 0
              updateItem.pop()
              return
            }
            this.diskOptionsDate[idx].remainder = this.diskOptionsDate[idx].remainder - values.size
            updateItem[updateItem.length - 1].size = updateItem[updateItem.length - 1].size - values.size
          } else {
            // 更新分区
            let oldSize = 0
            updateItem.forEach(item => {
              if (item.name === e.name) {
                item.name = values.name
                oldSize = item.size
                item.size = values.size
              }
            })
            // 如何剩余比更新的大
            if (this.diskOptionsDate[idx].remainder > values.size) {
              updateItem[updateItem.length - 1].size = updateItem[updateItem.length - 1].size + oldSize - values.size
              this.diskOptionsDate[idx].remainder = this.diskOptionsDate[idx].remainder + oldSize - values.size
              if (updateItem[updateItem.length - 1].name === i18n.t('compute.text_315')) {
                updateItem[updateItem.length - 1].size = this.diskOptionsDate[idx].remainder
              } else {
                updateItem.push({ name: i18n.t('compute.text_315'), size: this.diskOptionsDate[idx].remainder })
              }
            } else {
              if (values.method === 'autoextend') {
                this.diskOptionsDate[idx].remainder = 0
                updateItem.pop()
                return
              }
              this.diskOptionsDate[idx].remainder = (oldSize - values.size) + this.diskOptionsDate[idx].remainder
              if (this.diskOptionsDate[idx].remainder === 0) return
              if (updateItem[updateItem.length - 1].name === i18n.t('compute.text_315')) {
                updateItem[updateItem.length - 1].size = this.diskOptionsDate[idx].remainder
              } else {
                updateItem.push({ name: i18n.t('compute.text_315'), size: this.diskOptionsDate[idx].remainder })
              }
            }
          }
        },
      })
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    // raid计算大小公式
    raidUtil (n, raid, m) {
      let size = 0
      switch (raid) {
        case 'raid0':
          size = n * m
          break
        case 'raid1':
          size = n * m / m
          break
        case 'raid5':
          size = n * (m - 1)
          break
        case 'raid10':
          size = n * m / 2
          break
      }
      return size
    },
    async handleConfirm (e) {
      e.preventDefault()
      const diskConfigs = []
      const values = await this.validateForm()
      const disks = []
      const nets = []
      const extraData = {
        formType: this.cloudEnv,
        __resource_type__: 'baremetal',
        image_type: values.imageType,
        os: values.os,
        image: values.image.key,
        domain_id: values.domain.key,
        specifications: values.specifications,
        extraNets: [],
      }
      // 判断数据盘是否合法
      if (this.diskOptionsDate.length > 0) {
        if (this.isShowFalseIcon) {
          this.$message.error(i18n.t('compute.text_319'))
          throw new Error(i18n.t('compute.text_319'))
        }
        // 将系统盘放置首位
        const systemDisk = this.diskOptionsDate[0].chartData.rows.pop()
        this.diskOptionsDate[0].chartData.rows.unshift(systemDisk)
        for (var i = 0; i < this.diskOptionsDate.length; i++) {
          const rows = this.diskOptionsDate[i].chartData.rows
          const adapter = Number(this.diskOptionsDate[i].diskInfo[1].charAt(this.diskOptionsDate[i].diskInfo[1].length - 1))
          const configOption = {
            conf: this.diskOptionsDate[i].diskInfo[2],
            driver: this.diskOptionsDate[i].diskInfo[0],
            count: this.diskOptionsDate[i].count,
            range: this.diskOptionsDate[i].range,
            adapter,
            type: this.diskOptionsDate[i].type === 'HDD' ? 'rotate' : 'ssd',
          }
          diskConfigs.push(configOption)
          for (var j = 0; j < rows.length; j++) {
            let option = {
              size: rows[j].size * 1024,
              fs: rows[j].format,
              mountpoint: rows[j].name,
            }
            if (i === 0 && j === 0) {
              // 判断是否是iso导入
              if (values.imageType === 'iso') {
                option = {
                  size: rows[j].size * 1024,
                }
              } else {
                option = {
                  size: rows[j].size * 1024,
                  image_id: values.image.key,
                }
              }
            }
            if (j === rows.length - 1) {
              option.size = -1
              if (!rows[j].format) {
                Reflect.deleteProperty(option, 'fs')
              }
              if (rows[j].name === i18n.t('compute.text_315')) {
                Reflect.deleteProperty(option, 'mountpoint')
              }
            }
            disks.push(option)
          }
        }
        // 根据adapter排序diskConfigs
        diskConfigs.sort((a, b) => { return a.adapter - b.adapter })
      }
      if (values.networks) {
        const networks = values.networks
        for (const key in networks) {
          const option = {
            network: networks[key],
          }
          if (!R.isNil(values.networkIps) && !R.isEmpty(values.networkIps)) {
            option.address = values.networkIps[key]
          }
          if (values.networkIPv6s && values.networkIPv6s[key]) {
            option.require_ipv6 = true
          }
          if (values.networkIpsAddress6 && values.networkIpsAddress6[key]) {
            const ipv6Last = values.networkIpsAddress6[key]
            const target = this.form.fi.networkList.filter(item => item.key === key)
            const ipv6First = getIpv6Start(target[0]?.network?.guest_ip6_start)
            option.address6 = ipv6First + ipv6Last
          }
          if (values.networkIPv6Modes && values.networkIPv6Modes[key] === 'only' && option.require_ipv6) {
            option.strict_ipv6 = true
          }
          // 是否启用bonding
          if (this.isBonding) {
            option.require_teaming = true
            if (this.isInstallOperationSystem) option.private = false
            nets.push(option)
            if (values.vpcs && values.vpcs[key]) {
              const extraOption = { ...option, vpc: values.vpcs[key] }
              extraData.extraNets.push(extraOption)
            } else {
              extraData.extraNets.push(option)
            }
          } else {
            nets.push(option)
            if (values.vpcs && values.vpcs[key]) {
              const extraOption = { ...option, vpc: values.vpcs[key] }
              extraData.extraNets.push(extraOption)
            } else {
              extraData.extraNets.push(option)
            }
          }
        }
      } else if (values.networkSchedtags) {
        R.forEachObjIndexed((value, key) => {
          const obj = {
            id: value,
          }
          if (this.isBonding) {
            obj.require_teaming = true
          }
          const strategy = values.networkPolicys[key]
          if (strategy) {
            obj.strategy = strategy
          }
          nets.push({
            schedtags: [obj],
          })
        }, values.networkSchedtags)
      } else {
        // 是否启用bonding
        if (this.isBonding) {
          nets.push({ exit: false, require_teaming: true })
        } else {
          nets.push({ exit: false })
        }
      }
      // 判断是否是安装操作系统
      let params = {
        project_id: this.projectId.key,
        count: values.count,
        // vmem_size: Number(this.selectedSpecItem.mem.substr(0, this.selectedSpecItem.mem.length - 1)),
        vcpu_count: Number(this.selectedSpecItem.cpu),
        generate_name: values.name,
        hypervisor: 'baremetal',
        auto_start: true,
        vdi: 'vnc',
        disks,
        baremetal_disk_configs: diskConfigs,
        nets,
        prefer_host: this.isInstallOperationSystem ? this.$route.query.id : values.schedPolicyHost,
        description: values.description,
        prefer_region: values.cloudregion ? values.cloudregion.key : this.$route.query.region_id,
        prefer_zone: values.zone ? values.zone.key : this.$route.query.zone_id,
        __meta__: values.__meta__,
      }
      if (values.policySchedtagSchedtags) {
        const schedtags = []
        for (const key in values.policySchedtagSchedtags) {
          if (values.policySchedtagSchedtags[key]) {
            schedtags.push({
              id: values.policySchedtagSchedtags[key],
              strategy: values.policySchedtagPolicys[key],
            })
          }
        }
        params.schedtags = schedtags
      }
      if (values.loginPassword) params.password = values.loginPassword
      if (values.loginKeypair) params.keypair = values.loginKeypair.key
      if (values.loginType === 'image') params.reset_password = false
      if (this.selectedSpecItem.isolated_devices) params.isolated_devices = this.selectedSpecItem.isolated_devices
      // 判断是否是iso导入
      if (values.imageType === 'iso') {
        params = {
          ...params,
          cdrom: values.image.key,
        }
      }
      if (this.isInstallOperationSystem) {
        // Reflect.deleteProperty(params, 'project_id')
        this.createBaremetal(params)
      } else {
        if (this.isOpenWorkflow) { // 提交工单
          const workflowParams = {
            ...params,
            extraData,
          }
          const variables = {
            process_definition_key: WORKFLOW_TYPES.APPLY_MACHINE,
            initiator: this.$store.getters.userInfo.id,
            'server-create-paramter': JSON.stringify(workflowParams),
            project: this.projectId.key,
            project_domain: this.domainId.key,
          }
          this.doCreateWorkflow(variables, workflowParams)
        } else { // 创建裸金属
          this.doForecast(params)
        }
      }
    },
    // 创建工单
    doCreateWorkflow (variables, params) {
      this.submiting = true
      if (this.$route.query.workflow) {
        new this.$Manager('historic-process-instances', 'v1')
          .update({ id: `${this.$route.query.workflow}/variables`, data: { variables } })
          .then(() => {
            this.submiting = false
            this.$message.success(i18n.t('compute.text_320', [params.name]))
            this.$router.push('/workflow')
          })
      } else {
        new this.$Manager('process-instances', 'v1')
          .create({ data: { variables } })
          .then(() => {
            this.submiting = false
            this.$message.success(i18n.t('compute.text_320', [params.name]))
            this.$router.push('/workflow')
          })
          .catch(() => {
            this.submiting = false
          })
      }
    },
    doForecast (params) {
      this.submiting = true
      this.schedulerM.rpc({ methodname: 'DoForecast', params })
        .then(res => {
          if (res.data.can_create) {
            this.createBaremetal(params)
          } else {
            this.errors = this.getForecastErrors(res.data)
            this.submiting = false
          }
        })
        .catch(err => {
          this.$message.error(i18n.t('compute.text_321', [err]))
          this.submiting = false
        })
    },
    // 创建裸金属
    createBaremetal (data) {
      const { count } = data
      if (count > 1) {
        this.serverM.batchCreate({ data, count })
          .then(res => {
            this.submiting = false
            this.$message.success(i18n.t('compute.text_322'))
            if (this.isInstallOperationSystem) {
              this.$router.push('/physicalmachine')
            } else {
              this.$router.push('/baremetal')
            }
          })
          .catch(() => {
            this.submiting = false
          })
      } else {
        this.serverM.create({ data })
          .then(res => {
            this.submiting = false
            this.$message.success(i18n.t('compute.text_322'))
            if (this.isInstallOperationSystem) {
              this.$router.push('/physicalmachine')
            } else {
              this.$router.push('/baremetal')
            }
          })
          .catch(() => {
            this.submiting = false
          })
      }
    },
    getForecastErrors (data) {
      const errors = []
      if (data.filtered_candidates && data.filtered_candidates.length > 0) {
        for (let i = 0, len = data.filtered_candidates.length; i < len; i++) {
          const item = data.filtered_candidates[i]
          let message = `${i18n.t('dictionary.physicalmachine')}【${item.name}】`
          const filterMapItem = FORECAST_FILTERS_MAP[item.filter_name]
          if (filterMapItem) {
            message += filterMapItem
          } else {
            message += this.$t('compute.text_1325', [item.filter_name])
          }
          errors.push({
            message,
            children: item.reasons,
          })
        }
      } else {
        errors.push({
          message: i18n.t('compute.text_227'),
        })
      }
      return {
        errors,
        allow_count: data.allow_count,
        req_count: data.req_count,
        not_allow_reasons: data.not_allow_reasons,
      }
    },
    getSpecWire (currentSpec) {
      const manager = new this.$Manager('specs')
      const params = { host_type: 'baremetal', kind: 'hosts', key: currentSpec, ...this.scopeParams }
      manager.rpc({ methodname: 'GetObjects', params }).then(res => {
        const hosts = res.data || []
        this.wires = []
        for (const host of hosts) {
          let nicInfos = host.nic_info || []
          nicInfos = nicInfos.filter(item => !['ipmi', 'pxe'].includes(item.nic_type) && item.wire_id)
          const wireIds = nicInfos.map(item => item.wire_id)
          const newWireIds = Array.from(new Set(wireIds))
          this.wires = newWireIds
        }
      })
    },
    handleCancel () {
      this.$router.push({ name: 'Baremetal' })
    },
  },
}
