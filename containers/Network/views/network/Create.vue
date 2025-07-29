<template>
  <div>
    <page-header :title="$t('network.text_570')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body need-margin-bottom>
      <a-form class="mt-3" :form="form.fc" @submit.prevent="handleSubmit" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" class="mt-3" v-bind="formItemLayout">
          <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" @update:domain="handleDomainChange" />
        </a-form-item>
        <area-selects
          class="mb-0"
          ref="areaSelects"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="areaselectsName"
          :providerParams="providerParams"
          :cloudregionParams="cloudregionParams"
          :isRequired="true"
          filterBrandResource="network_manage"
          @change="handleRegionChange" />
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item label="VPC" v-bind="formItemLayout">
          <base-select
            v-decorator="decorators.vpc"
            resource="vpcs"
            :params="vpcParams"
            :isDefaultSelect="true"
            :needParams="true"
            @change="vpcChange"
            :item.sync="curVpc"
            :labelFormat="vpcLabelFormat"
            :select-props="{ placeholder: $t('common_226') }" />
        </a-form-item>
        <a-form-item :label="$t('network.text_571')" v-bind="formItemLayout" v-if="show || isShowWire">
          <base-select
            resource="wires"
            v-decorator="decorators.wire"
            :selectProps="{ 'placeholder': $t('network.text_572') }"
            :isDefaultSelect="true"
            :labelFormat="wireLabelFormat"
            :params="wireParams" />
        </a-form-item>
        <a-form-item :label="$t('network.text_24')" :extra="$t('network.text_573')" v-bind="formItemLayout" v-if="!show && !isShowWire">
          <a-select v-decorator="decorators.zone" :placeholder="$t('network.text_287')" :filterOption="filterOption" show-search>
            <a-select-option v-for="item in zoneList" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('network.text_574')" v-bind="formItemLayout" v-if="show">
          <a-radio-group v-decorator="decorators.server_type">
            <a-radio-button
              v-for="item of serverTypeOpts"
              :key="item.key"
              :value="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <!-- 网段 -->
        <a-form-item :label="$t('network.text_575')" v-bind="formItemLayout" required v-if="show">
          <template slot="extra">
            <div>{{$t('network.text_576')}}</div>
            <div>{{$t('network.text_577')}}</div>
          </template>
          <ip-subnets :decorator="decorators.ipSubnets" @clear-error="clearIpSubnetsError" />
          <div v-if="ipSubnetsHelp" class="error-tips">{{ ipSubnetsHelp }}</div>
        </a-form-item>
        <!-- 输入 网段 -->
        <a-form-item :label="$t('network.text_575')" :extra="$t('network.text_578')" v-bind="formItemLayout" v-if="!show && !isGroupGuestIpPrefix">
          <a-row :gutter="8">
            <a-col :span="12" v-if="curVpc && curVpc.cidr_block">
              <a-form-item class="mb-0">
                <a-input v-decorator="decorators.guest_ip_prefix(0)" :placeholder="$t('network.ipv4.prefix.prompt')" />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="curVpc && curVpc.cidr_block6">
              <a-form-item class="mb-0">
                <a-input v-decorator="decorators.guest_ip6_prefix(0)" :placeholder="$t('network.ipv6.prefix.prompt')" />
              </a-form-item>
            </a-col>
          </a-row>
          <div v-if="guestIpPrefixHelp" class="error-tips">{{ guestIpPrefixHelp }}</div>
        </a-form-item>
        <a-form-item :label="$t('network.text_575')" v-bind="formItemLayout" :validate-status="guestIpPrefixValidateStatus" :help="guestIpPrefixHelp" required v-if="isGroupGuestIpPrefix">
          <template slot="extra">
            <div>{{$t('network.text_578')}}</div>
            <div>{{$t('network.text_580')}}</div>
          </template>
          <!-- 网段 -->
          <a-row :gutter="8" v-for="(item, i) in guestIpPrefix" :key="item.key">
            <a-col :span="11">
              <a-form-item>
                <a-input v-decorator="decorators.guest_ip_prefix(i)" :placeholder="$t('network.ipv4.subnet.input.prompt')" />
              </a-form-item>
            </a-col>
            <a-col :span="11">
              <a-form-item>
                <a-input v-decorator="decorators.guest_ip6_prefix(i)" :placeholder="$t('network.ipv6.subnet.input.prompt')" />
              </a-form-item>
            </a-col>
            <a-col :span="2">
              <a-button shape="circle" icon="minus" size="small" v-if="guestIpPrefix.length > 1" @click="decrease(i)" class="mt-2 ml-2" />
            </a-col>
          </a-row>
          <div class="d-flex align-items-center" v-if="remain > 0">
            <a-button type="primary" shape="circle" icon="plus" size="small" @click="addGuestIpPrefix" />
            <a-button type="link" @click="addGuestIpPrefix">{{$t('network.text_582')}}</a-button>
            <span class="count-tips">{{$t('network.text_169')}}<span class="remain-num">{{ remain }}</span>{{$t('network.text_170')}}</span>
          </div>
        </a-form-item>
        <a-form-item label="dhcp_relay" v-if="show">
          <a-row :gutter="8">
            <a-col :span="12">
              <a-form-item class="mb-0" :extra="$t('network.dhcp_tooltip')">
                <a-input v-decorator="decorators.guest_dhcp" :placeholder="$t('common.tips.input', ['IPv4'])" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item class="mb-0" :extra="$t('network.dhcp_tooltip1')">
                <a-input v-decorator="decorators.guest_dhcp6" :placeholder="$t('common.tips.input', ['IPv6'])" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item :label="$t('common_498')" v-if="isShowIsAutoAlloc">
          <a-switch v-decorator="decorators.is_auto_alloc" />
          <template slot="extra">{{$t('common_500')}}</template>
        </a-form-item>
        <a-form-item :label="$t('common.text00012')" class="mb-0">
          <tag
            v-decorator="decorators.__meta__" />
        </a-form-item>
        <a-collapse :bordered="false" v-if="isShowAdvanceOptions">
          <a-collapse-panel :header="$t('network.text_94')" key="1" forceRender>
            <a-form-item :label="$t('network.text_743')" v-bind="formItemLayout" v-if="form.fd.server_type === 'eip'">
              <a-input v-decorator="decorators.bgp_type" />
              <span slot="extra">{{$t('network.text_744')}}</span>
            </a-form-item>
            <a-form-item v-bind="formItemLayout">
              <span slot="label">{{$t('network.text_583')}}</span>
              <a-radio-group v-decorator="decorators.alloc_policy">
                <a-radio-button
                  v-for="item of allocPolicyoptions"
                  :key="item.key"
                  :value="item.key">{{ item.label }}</a-radio-button>
              </a-radio-group>
              <span slot="extra" v-if="form.fc.getFieldValue('alloc_policy') === 'none'">{{$t('network.text_584')}}</span>
            </a-form-item>
            <a-form-item :label="$t('network.dns_server')" v-bind="formItemLayout">
              <a-row :gutter="8">
                <a-col :span="12">
                  <a-form-item class="mb-0">
                    <a-input :placeholder="$t('validator.IPv4s')" v-decorator="decorators.guest_dns" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item class="mb-0">
                    <a-input :placeholder="$t('validator.IPv6s')" v-decorator="decorators.guest_dns6" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item v-bind="formItemLayout">
              <span slot="label">{{$t('network.text_586')}}</span>
              <template slot="extra">
                <div>{{$t('network.text_587')}}</div>
                <div>{{$t('network.text_588')}}</div>
                <div>{{$t('network.text_589')}}</div>
                <div>{{$t('network.text_590')}}</div>
              </template>
              <a-input :placeholder="$t('validator.domain')" v-decorator="decorators.guest_domain" />
            </a-form-item>
            <a-form-item :label="$t('network.ntp_server')" v-bind="formItemLayout">
              <a-row :gutter="8">
                <a-col :span="12">
                  <a-form-item class="mb-0">
                    <a-input :placeholder="$t('validator.domains')" v-decorator="decorators.guest_ntp" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item class="mb-0">
                    <a-input :placeholder="$t('validator.domains6')" v-decorator="decorators.guest_ntp6" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form-item>
          </a-collapse-panel>
        </a-collapse>
        <page-footer>
          <template v-slot:right>
            <a-button type="primary" html-type="submit" class="ml-3" :loading="submiting">{{$t('network.text_30')}}</a-button>
            <a-button class="ml-3" @click="() => $router.back()">{{$t('common.cancel')}}</a-button>
          </template>
        </page-footer>
      </a-form>
    </page-body>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import validateForm, { isRequired, REGEXP } from '@/utils/validate'
import { Manager } from '@/utils/manager'
import { uuid } from '@/utils/utils'
import { typeClouds, getCloudEnvOptions } from '@/utils/common/hypervisor'
import DomainProject from '@/sections/DomainProject'
import AreaSelects from '@/sections/AreaSelects'
import i18n from '@/locales'
import { HYPERVISORS_MAP } from '@/constants'
import Tag from '@/sections/Tag'
import IpSubnets from './components/IpSubnets'

const { networkSegment, networkSegment6 } = REGEXP
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
  if (!value) {
    return callback()
  }
  // 只需要查看是否是以 0 结尾
  const ipItems = value.split('.')
  const msg = i18n.t('network.text_591')
  if (ipItems[ipItems.length - 1] === '0') {
    return callback(msg)
  }
  return callback()
}

function validateGateway6 (rule, value, callback) {
  if (!value) {
    return callback()
  }
  // 只需要查看是否是以 0 结尾
  const ipItems = value.split(':')
  const msg = i18n.t('network.text_591')
  if (ipItems[ipItems.length - 1] === '0') {
    return callback(msg)
  }
  return callback()
}

export default {
  name: 'NetworkCreate',
  components: {
    IpSubnets,
    DomainProject,
    AreaSelects,
    Tag,
  },
  data () {
    const cloudEnvOptions = getCloudEnvOptions('network_manage_brands', true)
    const queryType = this.$route.query.type
    let cloudEnv = queryType === 'idc' ? 'onpremise' : this.$route.query.type
    let routerQuery = this.$route.query.type
    if (!cloudEnvOptions.find(val => val.key === cloudEnv)) {
      cloudEnv = cloudEnvOptions[0].key
      routerQuery = cloudEnv === 'onpremise' ? 'idc' : cloudEnv
    }
    const prefixKey = uuid()
    return {
      submiting: false,
      cloudEnvOptions,
      cloudEnv,
      routerQuery,
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.handleValuesChange }),
        fd: {
          guest_ip_prefix: [],
          guest_ip6_prefix: [],
        },
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
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: ['description'],
        vpc: [
          'vpc',
          {
            rules: [
              { required: true, message: this.$t('network.text_274') },
            ],
          },
        ],
        wire: [
          'wire',
          {
            rules: [
              { required: true, message: this.$t('network.text_572') },
            ],
          },
        ],
        zone: [
          'zone',
          {
            rules: [
              { required: true, message: this.$t('network.text_287') },
            ],
          },
        ],
        server_type: [
          'server_type',
          {
            initialValue: 'guest',
            rules: [
              { required: true, message: this.$t('network.text_592') },
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
            rules: [
              { validator: this.$validate('IPv4s', false) },
            ],
          },
        ],
        guest_dns6: [
          'guest_dns6',
          {
            initialValue: '',
            rules: [
              { validator: this.$validate('IPv6s', false) },
            ],
          },
        ],
        guest_domain: [
          'guest_domain',
          {
            initialValue: '',
            rules: [
              { validator: this.$validate('domain', false) },
            ],
          },
        ],
        guest_ntp: [
          'guest_ntp',
          {
            initialValue: '',
            rules: [
              { validator: this.$validate('domains', false) },
            ],
          },
        ],
        guest_ntp6: [
          'guest_ntp6',
          {
            initialValue: '',
            rules: [
              { validator: this.$validate('domains6', false) },
            ],
          },
        ],
        ipSubnets: {
          startip: i => [
            `startip[${i}]`,
            {
              initialValue: '',
              validateFirst: true,
              rules: [
                // { required: true, message: this.$t('network.text_593') },
                { validator: this.validateIpv4 },
              ],
            },
          ],
          endip: i => [
            `endip[${i}]`,
            {
              initialValue: '',
              validateFirst: true,
              rules: [
                // { required: true, message: this.$t('network.text_594') },
                { validator: this.validateIpv4 },
              ],
            },
          ],
          netmask: i => [
            `netmask[${i}]`,
            {
              initialValue: '24',
              rules: [
                { required: true, message: this.$t('network.text_595') },
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
                { validator: this.validateIpv4 },
                { validator: validateGateway },
              ],
            },
          ],
          startip6: i => [
            `startip6[${i}]`,
            {
              initialValue: '',
              validateFirst: true,
              rules: [
                { validator: this.validateIpv6 },
              ],
            },
          ],
          endip6: i => [
            `endip6[${i}]`,
            {
              initialValue: '',
              validateFirst: true,
              rules: [
                { validator: this.validateIpv6 },
              ],
            },
          ],
          netmask6: i => [
            `netmask6[${i}]`,
            {
              initialValue: '64',
              rules: [
                { required: true, message: this.$t('network.text_595') },
              ],
            },
          ],
          gateway6: i => [
            `gateway6[${i}]`,
            {
              initialValue: '',
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { validator: this.validateIpv6 },
                { validator: validateGateway6 },
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
            validateFirst: true,
            rules: [
              { validator: this.validatePublicIpPrefix },
            ],
          },
        ],
        guest_ip6_prefix: i => [
          `guest_ip6_prefix[${i}]`,
          {
            initialValue: '',
            validateFirst: true,
            rules: [
              { validator: this.validatePublicIpPrefix6 },
            ],
          },
        ],
        guest_dhcp: [
          'guest_dhcp',
          {
            initialValue: '',
            validateFirst: true,
            rules: [
              { validator: this.validateDhcpRelay },
            ],
          },
        ],
        guest_dhcp6: [
          'guest_dhcp6',
          {
            initialValue: '',
            validateFirst: true,
            rules: [
              { validator: this.validateDhcpRelay6 },
            ],
          },
        ],
        is_auto_alloc: ['is_auto_alloc', {
          valuePropName: 'checked',
        }],
        bgp_type: [
          'bgp_type',
        ],
        __meta__: [
          '__meta__',
          {
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
      },
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
      isShowWire: true,
      isGroupGuestIpPrefix: false,
      show: true,
      regionProvider: '',
      regionId: '',
      guestIpPrefix: [{ key: prefixKey }],
      guestIp6Prefix: [{ key: prefixKey }],
      zoneList: [],
      project_domain: '',
      vpcId: '',
      curVpc: null,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    // 是否显示加入自动分配地址池
    isShowIsAutoAlloc () {
      const { vpc, server_type } = this.form.fd
      if (this.cloudEnv === 'onpremise' && vpc === 'default') {
        return ['guest', undefined].includes(server_type)
      }
      return true
    },
    // 是否显示高级配置
    isShowAdvanceOptions () {
      return this.cloudEnv === 'onpremise'
    },
    remain () {
      const remain = 6 - this.guestIpPrefix.length
      return Math.max(remain, 0)
    },
    vpcParams () {
      const params = {
        limit: 0,
        usable_vpc: true,
        scope: this.scope,
        cloudregion_id: this.regionId,
      }
      if (this.cloudEnv === 'private') {
        params.show_emulated = true
      }
      if (this.isAdminMode) {
        params.project_domain = this.project_domain
        delete params.scope
      }
      if (!this.regionId) return {}
      return params
    },
    cloudregionParams () {
      const params = {
        scope: this.scope,
        limit: 0,
        is_on_premise: true,
        // usable_vpc: true,
        show_emulated: true,
        usable: false,
      }
      if (this.cloudEnv === 'private') {
        params.is_private = true
        delete params.is_public
        delete params.is_on_premise
      } else if (this.cloudEnv === 'public') {
        params.is_public = true
        delete params.is_private
        delete params.is_on_premise
      } else {
        params.is_on_premise = true
        delete params.is_private
        delete params.is_public
      }
      if (this.isAdminMode) {
        params.project_domain = this.project_domain
        delete params.scope
      }
      return params
    },
    wireParams () {
      const params = {
        scope: this.scope,
        vpcId: this.vpcId,
      }
      if (this.isAdminMode) {
        params.project_domain = this.project_domain
        delete params.scope
      }
      return params
    },
    zoneParams () {
      const params = {
        scope: this.scope,
        show_emulated: true,
        'filter.0': 'status.equals(enable)',
        order: 'asc',
        order_by: 'external_id',
      }
      if (this.isAdminMode) {
        params.project_domain = this.project_domain
        delete params.scope
      }
      return params
    },
    areaselectsName () {
      if (this.cloudEnv === 'private' || this.cloudEnv === 'onpremise') {
        return ['cloudregion']
      }
      return ['provider', 'cloudregion']
    },
    providerParams () {
      return {
        cloud_env: 'public',
        usable: false,
        usable_vpc: true,
        project_domain: this.form.fd.domain?.key,
        filter: 'provider.notequals("Google")',
      }
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  watch: {
    cloudEnv (newValue) {
      this.$refs.areaSelects.fetchs(this.areaselectsName)
      if (newValue === 'private') {
        this.show = false
        this.isGroupGuestIpPrefix = false
      } else if (newValue === 'public') {
        this.show = false
        this.isGroupGuestIpPrefix = false
      } else {
        this.show = true
        this.isGroupGuestIpPrefix = true
      }
    },
    'form.fd.guest_ip_prefix': {
      handler (newValue) {
        if (newValue.filter(item => item).length > 0) {
          this.guestIpPrefixHelp = ''
        }
      },
    },
    'form.fd.guest_ip6_prefix': {
      handler (newValue) {
        if (newValue.filter(item => item).length > 0) {
          this.guestIpPrefixHelp = ''
        }
      },
    },
  },
  created () {
    this.initState()
  },
  methods: {
    validateIpv4 (rule, value, callback) {
      if (!value) {
        callback()
      } else if (!REGEXP.IPv4.regexp.test(value)) {
        callback(new Error(this.$t('common.tips.input', ['IPv4'])))
      }
      callback()
    },
    validateIpv6 (rule, value, callback) {
      if (!value) {
        callback()
      } else if (!REGEXP.IPv6.regexp.test(value)) {
        callback(new Error(this.$t('common.tips.input', ['IPv6'])))
      }
      callback()
    },
    validateDhcpRelay (rule, value, callback) {
      if (!value) {
        callback()
      } else if (!REGEXP.IPv4s.regexp.test(value)) {
        callback(new Error(this.$t('common.tips.input', ['IPv4'])))
      }
      callback()
    },
    validateDhcpRelay6 (rule, value, callback) {
      if (!value) {
        callback()
      } else if (!REGEXP.IPv6s.regexp.test(value)) {
        callback(new Error(this.$t('common.tips.input', ['IPv6'])))
      }
      callback()
    },
    initState () {
      if (this.cloudEnv === 'private') {
        this.show = false
        this.isGroupGuestIpPrefix = false
      } else if (this.cloudEnv === 'public') {
        this.show = false
        this.isGroupGuestIpPrefix = false
      } else {
        this.show = true
        this.isGroupGuestIpPrefix = true
      }
    },
    handleValuesChange (props, values) {
      this.form.fd = {
        ...this.form.fd,
        ...values,
      }
    },
    wireLabelFormat (item) {
      if (item) {
        const { name, zone } = item
        return (
          <div class='d-flex'>
            <span class='text-truncate flex-fill mr-2' title={ name }>{ name }</span>
            <span style="color: #8492a6; font-size: 13px">可用区:{zone}</span>
          </div>
        )
      }
      return null
    },
    handleDomainChange (val) {
      this.project_domain = val.key
    },
    addGuestIpPrefix () {
      this.clearGuestIpPrefixError()
      const key = uuid()
      this.guestIpPrefix.push({
        key,
      })
      this.guestIp6Prefix.push({
        key,
      })
    },
    decrease (index) {
      this.guestIpPrefix.splice(index, 1)
      this.guestIp6Prefix.splice(index, 1)
    },
    handleRegionChange (data) {
      const hasCloudRegion = R.has('cloudregion')(data)
      if (hasCloudRegion && !R.isEmpty(data.cloudregion)) {
        this.fetchZone(data.cloudregion.id)
      } else {
        this.zoneList = []
        this.form.fc.resetFields(['zone'])
        return
      }
      const { provider } = data.cloudregion.value
      this.regionProvider = provider
      this.regionId = data.cloudregion.id
      if (provider === typeClouds.providerMap.ZStack.key) {
        this.isShowWire = true
      } else {
        this.isShowWire = false
      }
    },
    vpcChange (vpcId) {
      this.vpcId = vpcId
      this.show = false
      if (this.cloudEnv === 'onpremise') {
        if (vpcId !== 'default') { // vpc network
          this.isGroupGuestIpPrefix = true
          this.show = false
        } else { // classic network
          this.isGroupGuestIpPrefix = false
          this.show = true
          this.form.fc.setFieldsValue({
            server_type: 'guest',
          })
        }
      }
      if (this.cloudEnv === 'private' && this.curVpc?.brand === 'Cloudpods' && this.curVpc?.external_id === 'default') {
        this.isShowWire = true
        this.isGroupGuestIpPrefix = true
      } else {
        this.isShowWire = false
        this.isGroupGuestIpPrefix = false
      }
    },
    vpcLabelFormat (item) {
      if (this.cloudEnv === 'public' || this.regionProvider === HYPERVISORS_MAP.hcso.provider || this.regionProvider === HYPERVISORS_MAP.hcs.provider) {
        if (item.manager) {
          if (item.cidr_block || item.cidr_block6) {
            return (<div>{ item.name }<span v-if="item.cidr_block">（{ item.cidr_block }）</span><span v-if="item.cidr_block6">（{ item.cidr_block6 }）</span><span class="ml-2 text-color-secondary">{ this.$t('common.cloudprovider_1var', [item.manager]) }</span></div>)
          }
          return (<div>{ item.name }<span class="ml-2 text-color-secondary">{ this.$t('common.cloudprovider_1var', [item.manager]) }</span></div>)
        }
      } else if (this.cloudEnv === 'onpremise') {
        if (item.cidr_block) {
          if (item.cidr_block6) {
            return (<div>{ item.name } ({ item.cidr_block }, { item.cidr_block6 })</div>)
          }
          return (<div>{ item.name } ({ item.cidr_block })</div>)
        }
        if (item.id === 'default') return (<div>{ item.name }<span v-if="item.cidr_block">（{this.$t('common.text00047')}）</span></div>)
      }
      return (<div>{ item.name }</div>)
    },
    validatePublicIpPrefix (rule, value, callback) {
      if (value) {
        if (!networkSegment.regexp.test(value)) {
          callback(new Error(networkSegment.message))
        }
        const maskNum = (value && value.split('/').length > 1) ? value.split('/')[1] : null
        const publicWire = this.form.fc.getFieldValue('cloudregion')
        if (maskNum && publicWire && publicWire.provider) {
          const provider = publicWire.provider.toLowerCase()
          if (masks[provider]) {
            const min = masks[provider].min
            const max = masks[provider].max
            if (masks[provider] && (maskNum < min || maskNum > max)) {
              callback(new Error(this.$t('network.text_604', [min, max])))
            }
          }
        }
      }
      callback()
    },
    validatePublicIpPrefix6 (rule, value, callback) {
      if (value) {
        if (!networkSegment6.regexp.test(value)) {
          callback(new Error(networkSegment6.message))
          return
        }
        const maskNum = (value && value.split('/').length > 1) ? value.split('/')[1] : null
        const min = 64
        const max = 64
        if (maskNum < min || maskNum > max) {
          callback(new Error(this.$t('network.text_604', [min, max])))
          return
        }
      }
      callback()
    },
    fetchZone (regionId) {
      new this.$Manager('cloudregions')
        .getSpecific({ id: regionId, spec: 'zones', params: this.zoneParams })
        .then(({ data: { data = [] } }) => {
          this.form.fc.resetFields(['zone'])
          this.zoneList = data
        })
    },
    genData (values) {
      const guest_dhcp = values.guest_dhcp
      const guest_dhcp6 = values.guest_dhcp6
      if (this.cloudEnv === 'onpremise') {
        const data = []
        if (this.isGroupGuestIpPrefix) {
          R.forEachObjIndexed((value, key) => {
            const obj = {
              alloc_policy: values.alloc_policy,
              guest_dns: values.guest_dns,
              guest_dns6: values.guest_dns6,
              guest_domain: values.guest_domain,
              guest_ntp: values.guest_ntp,
              guest_ntp6: values.guest_ntp6,
              guest_ip_prefix: value,
              guest_ip6_prefix: values.guest_ip6_prefix && values.guest_ip6_prefix[key],
              name: values.name,
              description: values.description,
              vpc: values.vpc,
              zone: values.zone,
              project_id: values.project?.key,
              is_auto_alloc: values.is_auto_alloc,
              guest_dhcp,
              guest_dhcp6,
              __meta__: values.__meta__,
            }
            data.push(obj)
          }, values.guest_ip_prefix)
        } else if (this.show) {
          R.forEachObjIndexed((value, key) => {
            const obj = {
              bgp_type: values.bgp_type,
              alloc_policy: values.alloc_policy,
              guest_dns: values.guest_dns,
              guest_dns6: values.guest_dns6,
              guest_domain: values.guest_domain,
              guest_ntp: values.guest_ntp,
              guest_ntp6: values.guest_ntp6,
              guest_ip_start: values.startip[key],
              guest_ip_end: values.endip[key],
              guest_ip_mask: values.netmask[key],
              guest_gateway: values.gateway[key],
              guest_ip6_start: values.startip6 && values.startip6[key],
              guest_ip6_end: values.endip6 && values.endip6[key],
              guest_ip6_mask: values.netmask6 && values.netmask6[key],
              guest_gateway6: values.gateway6 && values.gateway6[key],
              vlan_id: values.vlan[key] === '' ? '1' : values.vlan[key],
              name: values.name,
              description: values.description,
              project_id: values.project?.key,
              server_type: values.server_type,
              wire_id: values.wire,
              is_auto_alloc: values.is_auto_alloc,
              guest_dhcp,
              guest_dhcp6,
              __meta__: values.__meta__,
            }
            data.push(obj)
          }, values.startip)
        } else {
          R.forEachObjIndexed((value, key) => {
            const obj = {
              alloc_policy: values.alloc_policy,
              guest_dns: values.guest_dns,
              guest_dns6: values.guest_dns6,
              guest_domain: values.guest_domain,
              guest_ntp: values.guest_ntp,
              guest_ntp6: values.guest_ntp6,
              guest_ip_prefix: value,
              guest_ip6_prefix: values.guest_ip6_prefix && values.guest_ip6_prefix[key],
              name: values.name,
              description: values.description,
              vpc: values.vpc,
              zone: values.zone,
              project_id: values.project?.key,
              is_auto_alloc: values.is_auto_alloc,
              guest_dhcp,
              guest_dhcp6,
              __meta__: values.__meta__,
            }
            data.push(obj)
          }, values.guest_ip_prefix)
        }
        return data
      }
      if (this.regionProvider === typeClouds.providerMap.ZStack.key ||
        (this.cloudEnv === 'private' && this.curVpc?.brand === 'Cloudpods' && this.curVpc?.external_id === 'default')) {
        return {
          project_id: values.project?.key,
          guest_ip_prefix: values.guest_ip_prefix[0],
          guest_ip6_prefix: values.guest_ip6_prefix[0],
          name: values.name,
          description: values.description,
          wire_id: values.wire,
          is_auto_alloc: values.is_auto_alloc,
          guest_dhcp,
          guest_dhcp6,
          __meta__: values.__meta__,
        }
      }
      return {
        project_id: values.project?.key,
        guest_ip_prefix: values.guest_ip_prefix && values.guest_ip_prefix[0],
        guest_ip6_prefix: values.guest_ip6_prefix && values.guest_ip6_prefix[0],
        name: values.name,
        description: values.description,
        vpc: values.vpc,
        zone: values?.zone,
        is_auto_alloc: values.is_auto_alloc,
        guest_dhcp,
        guest_dhcp6,
        __meta__: values.__meta__,
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
      const ListPath = this.$router.resolve(this.$route.path)
      try {
        const values = await this.form.fc.validateFields()
        this.submiting = true
        if (this.cloudEnv === 'onpremise' && this.show && !this.isGroupGuestIpPrefix) {
          const keys = Object.keys(values.startip)
          let error = false
          keys.forEach(key => {
            if (!((values.startip[key] && values.endip[key] && values.gateway[key] && !values.startip6[key] && !values.endip6[key] && !values.gateway6[key]) || (values.startip6[key] && values.endip6[key] && values.gateway6[key] && !values.startip[key] && !values.endip[key] && !values.gateway[key]) || (values.startip[key] && values.endip[key] && values.gateway[key] && values.startip6[key] && values.endip6[key] && values.gateway6[key]))) {
              error = true
            }
          })
          if (error) {
            this.ipSubnetsHelp = this.$t('network.required_ipv4_or_ipv6_1')
            return
          }
        }
        // 验证ipv4 和 ipv6 网段 有一个必填
        if (!this.show && !this.isGroupGuestIpPrefix) {
          const guest_ip_prefix = R.is(Array, values.guest_ip_prefix) ? values.guest_ip_prefix[0] : values.guest_ip_prefix
          const guest_ip_prefix6 = R.is(Array, values.guest_ip6_prefix) ? values.guest_ip6_prefix[0] : values.guest_ip6_prefix
          if (!guest_ip_prefix && !guest_ip_prefix6) {
            this.guestIpPrefixValidateStatus = 'error'
            if (this.curVpc && this.curVpc.cidr_block && this.curVpc.cidr_block6) {
              this.guestIpPrefixHelp = this.$t('network.required_ipv4_or_ipv6')
            } else {
              this.guestIpPrefixHelp = this.$t('network.text_597')
            }
            return
          }
        }
        if (this.isGroupGuestIpPrefix && (R.isNil(values.guest_ip_prefix) || R.isEmpty(values.guest_ip_prefix))) {
          this.guestIpPrefixValidateStatus = 'error'
          this.guestIpPrefixHelp = this.$t('network.text_605')
          return
        }
        this.guestIpPrefixHelp = ''
        this.ipSubnetsHelp = ''
        const data = this.genData(values)
        const manager = new Manager('networks')
        if (this.cloudEnv === 'onpremise') {
          for (let i = 0, len = data.length; i < len; i++) {
            const bodyData = { ...data[i] }
            if (i > 0) {
              bodyData.name = `${bodyData.name}-${i + 1}`
            }
            await manager.create({
              data: {
                ...bodyData,
                dry_run: true,
              },
            })
            await manager.create({ data: bodyData })
          }
        } else {
          await manager.create({ data })
        }
        this.$router.push({ path: ListPath.resolved.matched[0].path })
      } catch (error) {
        throw error
      } finally {
        this.submiting = false
      }
    },
    filterOption (input, option) {
      const lastIdx = option.componentOptions.children.length - 1
      return (
        option.componentOptions.children[lastIdx].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>

<style lang="less" scoped>
.error-tips {
  color: #f5222d;
  margin-bottom: 3px;
  line-height: 16px;
}
</style>
