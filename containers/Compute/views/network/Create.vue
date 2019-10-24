<template>
  <div>
    <page-header title="新建IP子网" />
    <a-form class="mt-3" :form="form.fc" @submit.prevent="handleSubmit">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
      </a-form-item>
      <a-form-item label="二层网络" class="mb-0" v-bind="formItemLayout">
        <cloudregion-vpc-wire
          :vpc-params="params.vpc"
          :cloudregion-params="params.cloudregion"
          :wire-params="params.wire"
          :decorator="decorators.cloudregionVpcWire" />
      </a-form-item>
      <a-form-item label="服务器类型" v-bind="formItemLayout">
        <a-radio-group v-decorator="decorators.server_type">
          <a-radio-button
            v-for="item of serverTypeOpts"
            :key="item.key"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-bind="formItemLayout" :validate-status="ipSubnetsValidateStatus" :help="ipSubnetsHelp" required>
        <span slot="label">IP子网<help-tooltip class="ml-1" name="networkIpSubnets" /></span>
        <ip-subnets :decorator="decorators.ipSubnets" @clear-error="clearIpSubnetsError" />
      </a-form-item>
      <a-divider orientation="left">高级配置</a-divider>
      <a-form-item v-bind="formItemLayout">
        <span slot="label">地址分配策略<help-tooltip class="ml-1" name="networkPolicy" /></span>
        <a-radio-group v-decorator="decorators.alloc_policy">
          <a-radio-button
            v-for="item of allocPolicyoptions"
            :key="item.key"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="域名服务器" v-bind="formItemLayout">
        <a-input :placeholder="$t('validator.IPv4')" v-decorator="decorators.guest_dns" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout">
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
import { isRequired, isWithinRange } from '@/utils/validate'
import CloudregionVpcWire from '@/sections/CloudregionVpcWire'
import { Manager } from '@/utils/manager'

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

function checkIpInSegment (key, form) {
  return (rule, value, callback) => {
    const fd = form.fc.getFieldsValue()
    const startip = fd['startip'][key]
    const endip = fd['endip'][key]
    const isIn = isWithinRange(value, startip, endip)
    const msg = '输入的IP不在选择子网网段中'
    if (isIn) {
      callback()
    } else {
      callback(msg)
    }
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
        cloudregionVpcWire: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '' },
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
              initialValue: '16',
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
                { validator: checkIpInSegment(i, this.form) },
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
      },
      params: {
        cloudregion: {
          scope: this.$store.getters.scope,
          limit: 0,
          is_on_premise: true,
        },
        vpc: {
          scope: this.$store.getters.scope,
          limit: 0,
        },
        wire: {
          scope: this.$store.getters.scope,
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
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  methods: {
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
    genData (values) {
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
    },
    clearIpSubnetsError () {
      this.ipSubnetsValidateStatus = ''
      this.ipSubnetsHelp = ''
    },
    async handleSubmit () {
      this.submiting = true
      try {
        const values = await this.validateForm()
        if (R.isNil(values.startip) || R.isEmpty(values.startip)) {
          this.ipSubnetsValidateStatus = 'error'
          this.ipSubnetsHelp = '至少添加一个IP子网'
          return
        }
        const data = this.genData(values)
        const manager = new Manager('networks')
        for (let i = 0, len = data.length; i < len; i++) {
          const bodyData = { ...data[i] }
          if (i > 0) {
            bodyData.name = `${bodyData.name}-${i + 1}`
          }
          await manager.create({ data: bodyData })
        }
        this.$router.push({ name: 'NetworkList' })
      } finally {
        this.submiting = false
      }
    },
  },
}
</script>
