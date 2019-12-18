<template>
  <div>
    <page-header title="新建IP子网" />
    <a-form class="mt-3" :form="form.fc" @submit.prevent="handleSubmit">
      <a-divider orientation="left">基础配置</a-divider>
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
      <a-form-item :label="cloudRegionLabel" class="mb-0" v-bind="formItemLayout" v-if="show">
        <cloudregion-vpc-wire
          :vpc-params="params.vpc"
          :cloudregion-params="params.cloudregion"
          :wire-params="params.wire"
          :decorator="decorators.cloudregionVpcWire" />
      </a-form-item>
      <a-form-item :label="cloudRegionLabel" class="mb-0" v-bind="formItemLayout" v-if="!show">
        <cloudregion-vpc-wire
          @regionChange="regionChange"
          :vpc-params="params.vpc"
          :cloudregion-params="params.cloudregion"
          :zone-params="params.zone"
          :decorator="decorators.cloudregionVpcZone" />
      </a-form-item>
      <a-form-item label="服务器类型" v-bind="formItemLayout" v-if="show">
        <a-radio-group v-decorator="decorators.server_type">
          <a-radio-button
            v-for="item of serverTypeOpts"
            :key="item.key"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-bind="formItemLayout" :validate-status="ipSubnetsValidateStatus" :help="ipSubnetsHelp" required v-if="show">
        <span slot="label">IP子网<help-tooltip class="ml-1" name="networkIpSubnets" /></span>
        <ip-subnets :decorator="decorators.ipSubnets" @clear-error="clearIpSubnetsError" />
      </a-form-item>
      <a-form-item label="目标网段" v-bind="formItemLayout" v-if="!show">
        <a-input v-decorator="decorators.guest_ip_prefix" placeholder="目标网段，例如：192.168.0.0/24" />
      </a-form-item>
      <a-divider orientation="left" v-if="show">高级配置</a-divider>
      <a-form-item v-bind="formItemLayout" v-if="show">
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
        <a-input :placeholder="$t('validator.domain')" v-decorator="decorators.guest_domain" />
      </a-form-item>
      <page-footer>
        <a-button type="primary" html-type="submit" class="ml-3" :loading="submiting">确认</a-button>
      </page-footer>
    </a-form>
  </div>
</template>

<script>
import * as R from 'ramda'
import IpSubnets from './components/IpSubnets'
import { isRequired, REGEXP } from '@/utils/validate'
import CloudregionVpcWire from '@/sections/CloudregionVpcWire'
import { Manager } from '@/utils/manager'
import { typeClouds } from '@/utils/common/hypervisor'

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
    CloudregionVpcWire,
    IpSubnets,
  },
  data () {
    return {
      submiting: false,
      form: {
        fc: this.$form.createForm(this),
      },
      ipSubnetsValidateStatus: '',
      ipSubnetsHelp: '',
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
        cloudregionVpcWire: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '', provider: '' },
              rules: [
                { validator: isRequired(), message: '请选择区域' },
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
          wire: [
            'wire',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: '请选择二层网络' },
              ],
            },
          ],
        },
        cloudregionVpcZone: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '', provider: '' },
              rules: [
                { validator: isRequired(), message: '请选择区域' },
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
          zone: [
            'zone',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: '请选择可用区' },
              ],
            },
          ],
        },
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
        guest_ip_prefix: [
          'guest_ip_prefix',
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
      cloudRegionLabel: '二层网络',
      show: 'true',
      regionProvider: '',
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  methods: {
    regionChange (provider) {
      this.regionProvider = provider
      if (provider === typeClouds.providerMap.ZStack.key) {
        this.decorators.cloudregionVpcZone = {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '', provider: '' },
              rules: [
                { validator: isRequired(), message: '请选择区域' },
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
          wire: [
            'wire',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: '请选择二层网络' },
              ],
            },
          ],
        }
      } else {
        this.decorators.cloudregionVpcZone = {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '', provider: '' },
              rules: [
                { validator: isRequired(), message: '请选择区域' },
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
          zone: [
            'zone',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: '请选择可用区' },
              ],
            },
          ],
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
        this.cloudRegionLabel = '专有网络和可用区'
      } else if (e.target.value === 'public') {
        this.params.cloudregion = {
          limit: 0,
          usable_vpc: true,
          scope: this.$store.getters.scope,
          is_public: true,
          show_emulated: true,
        }
        this.show = false
        this.cloudRegionLabel = '专有网络和可用区'
      } else {
        this.params.cloudregion = {
          scope: this.$store.getters.scope,
          limit: 0,
          is_on_premise: true,
          show_emulated: true,
        }
        this.show = true
        this.cloudRegionLabel = '二层网络'
      }
    },
    genData (values) {
      if (values.platform_type === 'idc') {
        const data = []
        R.forEachObjIndexed((value, key) => {
          const obj = {
            alloc_policy: values.alloc_policy,
            guest_dns: values.guest_dns,
            guest_domain: values.guest_domain,
            guest_gateway: values['gateway'][key],
            guest_ip_end: values['endip'][key],
            guest_ip_mask: values['netmask'][key],
            guest_ip_start: values['startip'][key],
            name: values.name,
            server_type: values.server_type,
            wire_id: values['wire']['key'],
          }
          data.push(obj)
        }, values.startip)
        return data
      }
      if (this.regionProvider === typeClouds.providerMap.ZStack.key) {
        return {
          guest_ip_prefix: values.guest_ip_prefix,
          name: values.name,
          wire_id: values['wire']['key'],
        }
      }
      return {
        guest_ip_prefix: values.guest_ip_prefix,
        name: values.name,
        vpc: values['vpc']['key'],
        zone: values['zone']['key'],
      }
    },
    clearIpSubnetsError () {
      this.ipSubnetsValidateStatus = ''
      this.ipSubnetsHelp = ''
    },
    async handleSubmit () {
      this.submiting = true
      try {
        const values = await this.form.fc.validateFields()
        if (values.platform_type === 'idc' && (R.isNil(values.startip) || R.isEmpty(values.startip))) {
          this.ipSubnetsValidateStatus = 'error'
          this.ipSubnetsHelp = '至少添加一个IP子网'
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
              data: { 'network': bodyData },
            })
            await manager.create({ data: bodyData })
          }
        } else {
          await manager.create({ data })
        }
        this.$router.push({ name: 'Network' })
      } finally {
        this.submiting = false
      }
    },
  },
}
</script>
