<template>
  <div>
    <page-header :title="$t('network.text_606')" style="margin-bottom: 7px;" />
    <page-body needMarginBottom>
      <a-form class="mt-3" :form="form.fc">
        <a-divider orientation="left">{{$t('network.text_397')}}</a-divider>
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_198')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.platform_type">
            <a-radio-button
              v-for="item of platformOpts"
              :key="item.key"
              :disabled="item.key !== 'idc'"
              :value="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('network.text_574')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.server_type" @change="handleServerTypeChange">
            <a-radio-button
              v-for="item of serverTypeOpts"
              :key="item.key"
              :disabled="item.key !== server_type"
              :value="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('network.text_607')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.guest_ip_start" :disabled="!isClassicNetwork" />
        </a-form-item>
        <a-form-item :label="$t('network.text_608')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.guest_ip_end" :disabled="!isClassicNetwork" />
        </a-form-item>
        <a-form-item :label="$t('network.text_609')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.guest_ip_mask" :disabled="!isClassicNetwork">
            <a-select-option v-for="item in netMaskOptions" :key="item.value" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('network.text_610')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.guest_gateway" :disabled="!isClassicNetwork" />
        </a-form-item>
        <a-form-item :label="$t('network.ipv6.ip_start.label')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.guest_ip6_start" :disabled="!isClassicNetwork" />
        </a-form-item>
        <a-form-item :label="$t('network.ipv6.ip_end.label')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.guest_ip6_end" :disabled="!isClassicNetwork" />
        </a-form-item>
        <a-form-item :label="$t('network.ipv6.ip_mask.label')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.guest_ip6_mask" :disabled="!isClassicNetwork">
            <a-select-option v-for="item in net6MaskOptions" :key="item.value" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('network.ipv6.gateway.label')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.guest_gateway6" :disabled="!isClassicNetwork" />
        </a-form-item>
        <a-form-item label="VLAN ID" v-bind="formItemLayout">
          <a-input v-decorator="decorators.vlan_id" :disabled="!isClassicNetwork" />
        </a-form-item>
        <a-collapse :bordered="false" :active-key="getDefaultActiveKey">
          <a-collapse-panel :header="$t('network.text_94')" key="1" forceRender>
            <a-form-item :label="$t('network.text_743')" v-bind="formItemLayout" v-if="hasBgpType">
              <a-input v-decorator="decorators.bgp_type" />
              <span slot="extra">{{$t('network.text_744')}}</span>
            </a-form-item>
            <a-form-item v-bind="formItemLayout">
              <span slot="label">{{$t('network.text_583')}}<help-tooltip class="ml-1" name="networkPolicy" /></span>
              <a-radio-group v-decorator="decorators.alloc_policy">
                <a-radio-button
                  v-for="item of allocPolicyoptions"
                  :key="item.key"
                  :value="item.key">{{ item.label }}</a-radio-button>
              </a-radio-group>
            </a-form-item>
            <a-form-item :label="$t('network.dns_server')" v-bind="formItemLayout">
              <a-input :placeholder="$t('validator.IPs')" v-decorator="decorators.guest_dns" />
            </a-form-item>
            <a-form-item v-bind="formItemLayout">
              <span slot="label">{{$t('network.text_586')}}<help-tooltip class="ml-1" name="networkDomain" /></span>
              <a-input :placeholder="$t('validator.domain')" v-decorator="decorators.guest_domain" />
            </a-form-item>
            <a-form-item :label="$t('network.ntp_server')" v-bind="formItemLayout">
              <a-input :placeholder="$t('validator.IPs_or_domains')" v-decorator="decorators.guest_ntp" />
            </a-form-item>
            <a-form-item label="dhcp_relay" v-bind="formItemLayout">
              <a-input class="w-50" v-decorator="decorators.guest_dhcp" :placeholder="$t('validator.IPs')" />
            </a-form-item>
          </a-collapse-panel>
        </a-collapse>
      </a-form>
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" @click="handleSubmit" class="ml-3" :loading="submiting">{{$t('network.text_606')}}</a-button>
        <a-button class="ml-3" @click="() => $router.back()">{{$t('common.cancel')}}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import { REGEXP } from '@/utils/validate'
export default {
  name: 'EditAttributes',
  data () {
    return {
      submiting: false,
      form: {
        fc: this.$form.createForm(this),
      },
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
              { required: true, message: this.$t('network.text_116') },
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
        server_type: [
          'server_type',
          {
            initialValue: 'guest',
            validateTrigger: ['change', 'blur'],
            rules: [
              { required: true, message: this.$t('network.text_592') },
            ],
          },
        ],
        guest_ip_start: [
          'guest_ip_start',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              // { required: true, message: this.$t('network.text_593') },
              { validator: this.$validate('IPv4', false) },
            ],
          },
        ],
        guest_ip_end: [
          'guest_ip_end',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              // { required: true, message: this.$t('network.text_594') },
              { validator: this.$validate('IPv4', false) },
            ],
          },
        ],
        guest_ip_mask: [
          'guest_ip_mask',
          {
            initialValue: '16',
          },
        ],
        guest_gateway: [
          'guest_gateway',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              // { required: true, message: this.$t('network.text_611') },
              { validator: this.$validate('IPv4', false) },
              { validator: this.validateGateway },
            ],
          },
        ],
        guest_ip6_start: [
          'guest_ip6_start',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { validator: this.$validate('IPv6', false) },
            ],
          },
        ],
        guest_ip6_end: [
          'guest_ip6_end',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { validator: this.$validate('IPv6', false) },
            ],
          },
        ],
        guest_ip6_mask: [
          'guest_ip6_mask',
          {
            initialValue: '64',
          },
        ],
        guest_gateway6: [
          'guest_gateway6',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { validator: this.$validate('IPv6', false) },
              { validator: this.validateGateway6 },
            ],
          },
        ],
        vlan_id: [
          'vlan_id',
        ],
        alloc_policy: [
          'alloc_policy',
          {
            initialValue: 'none',
          },
        ],
        guest_dhcp: [
          'guest_dhcp',
          {
            validateFirst: true,
            rules: [
              { validator: this.$validate('IPs', false) },
            ],
          },
        ],
        guest_dns: [
          'guest_dns',
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            rules: [
              { validator: this.$validate('IPs', false) },
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
        guest_ntp: [
          'guest_ntp',
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            rules: [
              { validator: this.$validate('IPs_or_domains', false) },
            ],
          },
        ],
        bgp_type: [
          'bgp_type',
        ],
      },
      params: {
        wire: {
          scope: this.$store.getters.scope,
        },
      },
      platformOpts: [
        { label: this.$t('network.text_207'), key: 'idc' },
        { label: this.$t('network.text_208'), key: 'private' },
        { label: this.$t('network.text_209'), key: 'public' },
      ],
      serverTypeOpts: [
        { label: this.$t('network.text_226'), key: 'guest' },
        { label: this.$t('network.text_598'), key: 'baremetal' },
        // { label: this.$t('network.text_599'), key: 'container' },
        { label: 'PXE', key: 'pxe' },
        { label: 'IPMI', key: 'ipmi' },
        { label: this.$t('network.text_221'), key: 'eip' },
        { label: this.$t('network.server_type.hostlocal.text'), key: 'hostlocal' },
      ],
      allocPolicyoptions: [
        { label: this.$t('network.text_600'), key: 'none' },
        { label: this.$t('network.text_601'), key: 'stepdown' },
        { label: this.$t('network.text_602'), key: 'stepup' },
        { label: this.$t('network.text_603'), key: 'random' },
      ],
      netMaskOptions: [
        { label: '16', value: '16' },
        { label: '17', value: '17' },
        { label: '18', value: '18' },
        { label: '19', value: '19' },
        { label: '20', value: '20' },
        { label: '21', value: '21' },
        { label: '22', value: '22' },
        { label: '23', value: '23' },
        { label: '24', value: '24' },
        { label: '25', value: '25' },
        { label: '26', value: '26' },
        { label: '27', value: '27' },
        { label: '28', value: '28' },
        { label: '29', value: '29' },
        { label: '30', value: '30' },
      ],
      net6MaskOptions: [
        { label: '64', value: '64' },
        { label: '72', value: '72' },
        { label: '80', value: '80' },
        { label: '88', value: '88' },
        { label: '96', value: '96' },
        { label: '104', value: '104' },
        { label: '112', value: '112' },
        { label: '120', value: '120' },
        { label: '124', value: '124' },
      ],
      wire_id: '',
      cloudEnv: '',
      vpcId: '',
      server_type: 'guest',
    }
  },
  computed: {
    isClassicNetwork () {
      return this.vpcId === 'default'
    },
    getDefaultActiveKey () {
      if (this.vpcId === 'default') {
        return '0' // hide
      } else {
        return '1' // show
      }
    },
    hasBgpType () {
      return this.server_type === 'eip' || this.server_type === 'guest' || this.server_type === 'baremetal' || this.server_type === 'hostlocal'
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  mounted () {
    this.bindData()
  },
  methods: {
    fetchData () {
      return new this.$Manager('networks').get({ id: this.$route.query.network_id })
    },
    handleServerTypeChange (e) {
      this.server_type = e.target.value
    },
    async bindData () {
      const { data } = await this.fetchData()
      this.form.fc.setFieldsValue({
        name: data.name,
        server_type: data.server_type,
        guest_ip_start: data.guest_ip_start,
        guest_ip_end: data.guest_ip_end,
        guest_ip_mask: data.guest_ip_mask,
        guest_gateway: data.guest_gateway,
        guest_ip6_start: data.guest_ip6_start,
        guest_ip6_end: data.guest_ip6_end,
        guest_ip6_mask: data.guest_ip6_mask,
        guest_gateway6: data.guest_gateway6,
        vlan_id: data.vlan_id || '',
        alloc_policy: data.alloc_policy,
        guest_dns: data.guest_dns || '',
        guest_domain: data.guest_domain || '',
        guest_ntp: data.guest_ntp || '',
        guest_dhcp: data.guest_dhcp || '',
      })
      this.form.fc.getFieldDecorator('bgp_type', { initialValue: data.bgp_type })
      this.wire_id = data.wire_id
      this.cloudEnv = data.cloud_env
      this.vpcId = data.vpc_id
      this.server_type = data.server_type
    },
    validateGateway (rule, value, callback) {
      if (!value) {
        return callback()
      }
      // 只需要查看是否是以 0 结尾
      const ipItems = value.split('.')
      if (ipItems[ipItems.length - 1] === '0') {
        callback(new Error(this.$t('network.text_591')))
      } else {
        callback()
      }
    },
    validateGateway6 (rule, value, callback) {
      if (!value) {
        return callback()
      }
      // 只需要查看是否是以 0 结尾
      const ipItems = value.split(':')
      if (ipItems[ipItems.length - 1] === '0') {
        callback(new Error(this.$t('network.text_591')))
      } else {
        callback()
      }
    },
    validateDhcpRelay (rule, value, callback) {
      if (!value) {
        callback()
      } else if (!REGEXP.IPv4s.regexp.test(value)) {
        callback(new Error(this.$t('common.tips.input', ['IPv4'])))
      }
      callback()
    },
    doUpdate (data) {
      return new this.$Manager('networks').update({
        id: this.$route.query.network_id,
        data,
      })
    },
    async handleSubmit () {
      this.submiting = true
      try {
        let values = await this.form.fc.validateFields()
        values = {
          ...values,
          wire_id: this.wire_id,
        }
        if (!((values.guest_ip_start && values.guest_ip_end) || (values.guest_ip6_start && values.guest_ip6_end))) {
          this.$message.warning(this.$t('network.required_ipv4_or_ipv6_1'))
          this.submiting = false
          return
        }
        await this.doUpdate(values)
        this.$store.commit('keepAlive/ADD_DELAY_EVENT', { name: 'ResourceListSingleRefresh', params: [this.$route.query.network_id] })
        const networkPath = this.$router.resolve(this.$route.path)
        this.$router.push({ path: networkPath.resolved.matched[0].path })
      } catch (err) {
        throw err
      } finally {
        this.submiting = false
      }
    },
  },
}
</script>
