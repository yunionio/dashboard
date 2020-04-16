<template>
  <div>
    <page-header title="新建IP子网" />
    <a-form class="mt-3" :form="form.fc" @submit.prevent="handleSubmit">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item :label="`指定${$t('dictionary.project')}`" v-bind="formItemLayout">
        <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
      </a-form-item>
      <a-form-item label="平台" v-bind="formItemLayout">
        <a-radio-group v-decorator="decorators.platform_type" @change="handlePlatformChange">
          <a-radio-button
            v-for="item of platformOpts"
            :key="item.key"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="VPC" class="mb-0" v-bind="formItemLayout">
        <cloudregion-vpc
          @regionChange="regionChange"
          @vpcChange="vpcChange"
          :cloudregion-params="params.cloudregion"
          :vpc-params="params.vpc"
          :decorator="decorators.cloudregionVpc" />
      </a-form-item>
      <a-form-item label="二层网络" v-bind="formItemLayout" v-if="show || isShowWire">
        <base-select
          resource="wires"
          v-decorator="decorators.wire"
          :selectProps="{ 'placeholder': '请选择二层网络' }"
          :params="params.wire" />
      </a-form-item>
      <a-form-item label="可用区" extra="同一 VPC 下可以有不同可用区的子网，同一 VPC 下不同可用区的子网默认可以内网互通。" v-bind="formItemLayout" v-if="!show && !isShowWire">
        <a-select v-decorator="decorators.zone" placeholder="请选择可用区">
          <a-select-option v-for="item in zoneList" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="服务器类型" v-bind="formItemLayout" v-if="show">
        <a-radio-group v-decorator="decorators.server_type">
          <a-radio-button
            v-for="item of serverTypeOpts"
            :key="item.key"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="子网网段" v-bind="formItemLayout" :validate-status="ipSubnetsValidateStatus" :help="ipSubnetsHelp" required v-if="show">
        <template slot="extra">
          <div>1.VLAN ID用于网络物理隔离，默认1，相同VLAN ID的IP子网互通，不同VLAN ID的IP子网不通。</div>
          <div>2.创建多个IP子网时，系统自动分配名称，例如：名称为net，增加3个IP子网，名称依次为net0、net1、net。</div>
        </template>
        <ip-subnets :decorator="decorators.ipSubnets" @clear-error="clearIpSubnetsError" />
      </a-form-item>
      <a-form-item label="子网网段" extra="子网的 CIDR 必须是所在 VPC CIDR 的一部分，且不能和该 VPC 下已有子网的 CIDR 重叠。" v-bind="formItemLayout" v-if="!show && !isGroupGuestIpPrefix">
        <a-input v-decorator="decorators.guest_ip_prefix(0)" placeholder="请输入IP段" />
      </a-form-item>
      <a-form-item label="子网网段" v-bind="formItemLayout" :validate-status="guestIpPrefixValidateStatus" :help="guestIpPrefixHelp" required v-if="isGroupGuestIpPrefix">
        <template slot="extra">
          <div>子网的 CIDR 必须是所在 VPC CIDR 的一部分，且不能和该 VPC 下已有子网的 CIDR 重叠。</div>
          <div>创建多个IP子网时，系统自动分配名称，例如：名称为net，增加3个IP子网，名称依次为net0、net1、net。</div>
        </template>
        <div class="d-flex" v-for="(item, i) in guestIpPrefix" :key="item.key">
          <a-form-item>
            <a-input v-decorator="decorators.guest_ip_prefix(i)" placeholder="请输入子网网段" />
          </a-form-item>
          <a-button shape="circle" icon="minus" size="small" v-if="guestIpPrefix.length > 1" @click="decrease(i)" class="mt-2 ml-2" />
        </div>
        <div class="d-flex align-items-center" v-if="remain > 0">
          <a-button type="primary" shape="circle" icon="plus" size="small" @click="addGuestIpPrefix" />
          <a-button type="link" @click="addGuestIpPrefix">添加子网网段</a-button>
          <span class="count-tips">您还可以添加 <span class="remain-num">{{ remain }}</span> 个</span>
        </div>
      </a-form-item>
      <a-divider orientation="left" v-if="show">高级配置</a-divider>
      <a-form-item extra="缺省策略为：物理机从高地址分配，虚拟机从低地址分配" v-bind="formItemLayout" v-if="show">
        <span slot="label">地址分配策略<help-tooltip class="ml-1" name="networkPolicy" /></span>
        <a-radio-group v-decorator="decorators.alloc_policy">
          <a-radio-button
            v-for="item of allocPolicyoptions"
            :key="item.key"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="域名服务器" v-bind="formItemLayout" v-if="show">
        <a-input :placeholder="$t('validator.IPv4')" v-decorator="decorators.guest_dns" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" v-if="show">
        <span slot="label">主机域名后缀<help-tooltip class="ml-1" name="networkDomain" /></span>
        <template slot="extra">
          <div>系统为主机分配IP时，会同时创建一条指向该IP的域名记录，域名由主机名称+主机域名后缀组成。例如：</div>
          <div>主机名称为vm01，主机ip为192.168.1.1</div>
          <div>主机域名后缀为gh.baidu.com</div>
          <div>主机创建成功后，ping vm01.gh.baidu.com就会得到vm01的ip</div>
        </template>
        <a-input :placeholder="$t('validator.domain')" v-decorator="decorators.guest_domain" />
      </a-form-item>
      <page-footer>
        <template v-slot:right>
          <a-button type="primary" html-type="submit" class="ml-3" :loading="submiting" size="large">确定</a-button>
        </template>
      </page-footer>
    </a-form>
  </div>
</template>

<script>
import * as R from 'ramda'
import IpSubnets from './components/IpSubnets'
import { isRequired, REGEXP } from '@/utils/validate'
import CloudregionVpc from '@/sections/CloudregionVpc'
import { Manager } from '@/utils/manager'
import { uuid } from '@/utils/utils'
import { typeClouds } from '@/utils/common/hypervisor'
import DomainProject from '@/sections/DomainProject'
import i18n from '@/locales'

const { networkSegment } = REGEXP
const masks = {
  azure: { min: 8, max: 29 },
  qcloud: { min: 16, max: 28 },
  aliyun: { min: 17, max: 29 },
  aws: { min: 16, max: 28 },
  ucloud: { min: 16, max: 29 },
  huawei: { min: 16, max: 29 },
  onecloud: undefined,
  vmware: undefined,
  baremetal: undefined,
  openstack: undefined,
  zstack: undefined,
  dstack: undefined,
}

function validateGateway (rule, value, callback) {
  // 只需要查看是否是以 0 结尾
  const ipItems = value.split('.')
  const msg = '网关不能以0结尾'
  if (ipItems[ipItems.length - 1] === '0') {
    callback(msg)
  } else {
    callback()
  }
}

export default {
  name: 'NetworkCreate',
  components: {
    CloudregionVpc,
    IpSubnets,
    DomainProject,
  },
  data () {
    return {
      submiting: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.domain) {
              this.params.cloudregion = {
                ...this.params.cloudregion,
                project_domain: values.domain.key,
              }
            }
          },
        }),
      },
      ipSubnetsValidateStatus: '',
      guestIpPrefixValidateStatus: '',
      ipSubnetsHelp: '',
      guestIpPrefixHelp: '',
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
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        platform_type: [
          'platform_type',
          {
            initialValue: 'idc',
            validateTrigger: ['change', 'blur'],
          },
        ],
        cloudregionVpc: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '', provider: '' },
              rules: [
                { validator: isRequired(), message: this.$t('rules.domain') },
              ],
            },
          ],
          vpc: [
            'vpc',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: '请选择VPC' },
              ],
            },
          ],
        },
        wire: [
          'wire',
          {
            rules: [
              { required: true, message: '请选择二层网络' },
            ],
          },
        ],
        zone: [
          'zone',
          {
            rules: [
              { required: true, message: '请选择可用区' },
            ],
          },
        ],
        server_type: [
          'server_type',
          {
            initialValue: 'guest',
            validateTrigger: ['change', 'blur'],
            rules: [
              { required: true, message: '请选择服务器类型' },
            ],
          },
        ],
        alloc_policy: [
          'alloc_policy',
          {
            initialValue: 'none',
          },
        ],
        guest_dns: [
          'guest_dns',
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            rules: [
              { validator: this.$validate('IPv4', false) },
            ],
          },
        ],
        guest_domain: [
          'guest_domain',
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            rules: [
              { validator: this.$validate('domain', false) },
            ],
          },
        ],
        ipSubnets: {
          startip: i => [
            `startip[${i}]`,
            {
              initialValue: '',
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { required: true, message: '请输入起始IP' },
                { validator: this.$validate('IPv4') },
              ],
            },
          ],
          endip: i => [
            `endip[${i}]`,
            {
              initialValue: '',
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { required: true, message: '请输入结束IP' },
                { validator: this.$validate('IPv4') },
              ],
            },
          ],
          netmask: i => [
            `netmask[${i}]`,
            {
              initialValue: '24',
              validateTrigger: ['change', 'blur'],
              rules: [
                { required: true, message: '请选择子网掩码' },
              ],
            },
          ],
          gateway: i => [
            `gateway[${i}]`,
            {
              initialValue: '',
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { required: true, message: '请输入默认网关' },
                { validator: this.$validate('IPv4') },
                { validator: validateGateway },
              ],
            },
          ],
          vlan: i => [
            `vlan[${i}]`,
            {
              initialValue: '',
            },
          ],
        },
        guest_ip_prefix: i => [
          `guest_ip_prefix[${i}]`,
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: '请输入目标网段' },
              { validator: this.validatePublicIpPrefix },
            ],
          },
        ],
      },
      params: {
        cloudregion: {
          scope: this.$store.getters.scope,
          limit: 0,
          is_on_premise: true,
        },
        vpc: {
          scope: this.$store.getters.scope,
          show_emulated: true,
          limit: 0,
          usable_vpc: true,
        },
        wire: {
          scope: this.$store.getters.scope,
        },
        zone: {
          scope: this.$store.getters.scope,
          show_emulated: true,
        },
      },
      serverTypeOpts: [
        { label: '虚拟机', key: 'guest' },
        { label: '物理机', key: 'baremetal' },
        { label: '容器', key: 'container' },
        { label: 'PXE', key: 'pxe' },
        { label: 'IPMI', key: 'ipmi' },
      ],
      allocPolicyoptions: [
        { label: '缺省策略', key: 'none' },
        { label: '从高地址分配', key: 'stepdown' },
        { label: '从低地址分配', key: 'stepup' },
        { label: '随机分配', key: 'random' },
      ],
      platformOpts: [
        { label: '本地IDC', key: 'idc' },
        { label: '私有云', key: 'private' },
        { label: '公有云', key: 'public' },
      ],
      isShowWire: true,
      isGroupGuestIpPrefix: false,
      show: 'true',
      regionProvider: '',
      regionId: '',
      guestIpPrefix: [{ key: uuid() }],
      zoneList: [],
    }
  },
  computed: {
    remain () {
      const remain = 6 - this.guestIpPrefix.length
      return Math.max(remain, 0)
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  methods: {
    addGuestIpPrefix () {
      this.clearGuestIpPrefixError()
      const key = uuid()
      this.guestIpPrefix.push({
        key,
      })
    },
    decrease (index) {
      this.guestIpPrefix.splice(index, 1)
    },
    regionChange (data) {
      if (data) {
        this.fetchZone(data.key)
      } else {
        this.zoneList = []
        this.form.fc.resetFields(['zone'])
        return
      }
      this.regionProvider = data.provider
      this.regionId = data.key
      if (data.provider === typeClouds.providerMap.ZStack.key) {
        this.isShowWire = true
      } else {
        this.isShowWire = false
      }
    },
    vpcChange (vpcId) {
      this.params.wire = {
        ...this.params.wire,
        vpc: vpcId,
      }
      const platformType = this.form.fc.getFieldValue('platform_type')
      if (platformType === 'idc') {
        if (vpcId !== 'default') {
          this.isGroupGuestIpPrefix = true
          this.show = false
        } else {
          this.isGroupGuestIpPrefix = false
          this.show = true
        }
      }
    },
    validatePublicIpPrefix (rule, value, callback) {
      if (!networkSegment.regexp.test(value)) {
        callback(new Error(networkSegment.message))
      }
      const maskNum = (value && value.split('/').length > 1) ? value.split('/')[1] : null
      const publicWire = this.form.fc.getFieldValue('cloudregion')
      if (maskNum && publicWire && publicWire.provider) {
        const provider = publicWire['provider'].toLowerCase()
        if (masks[provider]) {
          const min = masks[provider].min
          const max = masks[provider].max
          if (masks[provider] && (maskNum < min || maskNum > max)) {
            callback(new Error(`子网掩码错误，IP子网掩码的范围是${min}~${max}`))
          }
        }
      }
      callback()
    },
    fetchZone (regionId) {
      new this.$Manager('cloudregions')
        .getSpecific({ id: regionId, spec: 'zones', params: this.params.zone })
        .then(({ data: { data = [] } }) => {
          this.zoneList = data
        })
    },
    handlePlatformChange (e) {
      if (e.target.value === 'private') {
        this.params.cloudregion = {
          limit: 0,
          usable_vpc: true,
          scope: this.$store.getters.scope,
          is_private: true,
          show_emulated: true,
        }
        this.show = false
      } else if (e.target.value === 'public') {
        this.params.cloudregion = {
          limit: 0,
          usable_vpc: true,
          scope: this.$store.getters.scope,
          is_public: true,
          show_emulated: true,
        }
        this.show = false
      } else {
        this.params.cloudregion = {
          scope: this.$store.getters.scope,
          limit: 0,
          is_on_premise: true,
          show_emulated: true,
        }
        this.show = true
      }
    },
    genData (values) {
      if (values.platform_type === 'idc') {
        const data = []
        if (this.isGroupGuestIpPrefix) {
          R.forEachObjIndexed((value, key) => {
            const obj = {
              guest_ip_prefix: value,
              name: values.name,
              vpc: values['vpc']['key'],
              zone: values['zone'],
              project_id: values['project']['key'],
            }
            data.push(obj)
          }, values.guest_ip_prefix)
        } else {
          R.forEachObjIndexed((value, key) => {
            const obj = {
              alloc_policy: values.alloc_policy,
              guest_dns: values.guest_dns,
              guest_domain: values.guest_domain,
              guest_gateway: values['gateway'][key],
              guest_ip_end: values['endip'][key],
              guest_ip_mask: values['netmask'][key],
              guest_ip_start: values['startip'][key],
              vlan_id: values['vlan'][key] === '' ? '1' : values['vlan'][key],
              name: values.name,
              project_id: values['project']['key'],
              server_type: values.server_type,
              wire_id: values['wire'],
            }
            data.push(obj)
          }, values.startip)
        }
        return data
      }
      if (this.regionProvider === typeClouds.providerMap.ZStack.key) {
        return {
          project_id: values['project']['key'],
          guest_ip_prefix: values.guest_ip_prefix[0],
          name: values.name,
          wire_id: values['wire'],
        }
      }
      return {
        project_id: values['project']['key'],
        guest_ip_prefix: values.guest_ip_prefix[0],
        name: values.name,
        vpc: values['vpc']['key'],
        zone: values['zone'],
      }
    },
    clearIpSubnetsError () {
      this.ipSubnetsValidateStatus = ''
      this.ipSubnetsHelp = ''
    },
    clearGuestIpPrefixError () {
      this.guestIpPrefixValidateStatus = ''
      this.guestIpPrefixHelp = ''
    },
    async handleSubmit () {
      this.submiting = true
      const ListPath = this.$router.resolve(this.$route.path)
      try {
        const values = await this.form.fc.validateFields()
        if (values.platform_type === 'idc' && !this.isGroupGuestIpPrefix && (R.isNil(values.startip) || R.isEmpty(values.startip))) {
          this.ipSubnetsValidateStatus = 'error'
          this.ipSubnetsHelp = '至少添加一个子网网段'
          return
        }
        if (this.isGroupGuestIpPrefix && (R.isNil(values.guest_ip_prefix) || R.isEmpty(values.guest_ip_prefix))) {
          this.guestIpPrefixValidateStatus = 'error'
          this.guestIpPrefixHelp = '至少添加一个子网网段'
          return
        }
        const data = this.genData(values)
        const manager = new Manager('networks')
        if (values.platform_type === 'idc') {
          for (let i = 0, len = data.length; i < len; i++) {
            const bodyData = { ...data[i] }
            if (i > 0) {
              bodyData.name = `${bodyData.name}-${i + 1}`
            }
            await manager.performClassAction({
              action: 'check-create-data',
              data: bodyData,
            })
            await manager.create({ data: bodyData })
          }
        } else {
          await manager.create({ data })
        }
        this.$router.push({ path: ListPath.resolved.matched[0].path })
      } finally {
        this.submiting = false
      }
    },
  },
}
</script>
