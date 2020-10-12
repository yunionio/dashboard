<template>
  <div>
    <page-header :title="$t('network.text_570')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <a-form class="mt-3" :form="form.fc" @submit.prevent="handleSubmit" v-bind="formItemLayout">
      <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" class="mt-3 mb-0" v-bind="formItemLayout">
        <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" @update:domain="handleDomainChange" />
      </a-form-item>
      <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
      </a-form-item>
      <area-selects
        class="mb-0"
        ref="areaSelects"
        :wrapperCol="formItemLayout.wrapperCol"
        :labelCol="formItemLayout.labelCol"
        :names="areaselectsName"
        :cloudregionParams="cloudregionParams"
        :isRequired="true"
        @change="handleRegionChange" />
      <a-form-item label="VPC" v-bind="formItemLayout">
        <base-select
          v-decorator="decorators.vpc"
          resource="vpcs"
          :params="vpcParams"
          :isDefaultSelect="true"
          :needParams="true"
          @change="vpcChange"
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
        <a-select v-decorator="decorators.zone" :placeholder="$t('network.text_287')">
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
      <a-form-item :label="$t('network.text_575')" v-bind="formItemLayout" :validate-status="ipSubnetsValidateStatus" :help="ipSubnetsHelp" required v-if="show">
        <template slot="extra">
          <div>{{$t('network.text_576')}}</div>
          <div>{{$t('network.text_577')}}</div>
        </template>
        <ip-subnets :decorator="decorators.ipSubnets" @clear-error="clearIpSubnetsError" />
      </a-form-item>
      <a-form-item :label="$t('network.text_575')" :extra="$t('network.text_578')" v-bind="formItemLayout" v-if="!show && !isGroupGuestIpPrefix">
        <a-input v-decorator="decorators.guest_ip_prefix(0)" :placeholder="$t('network.text_579')" />
      </a-form-item>
      <a-form-item :label="$t('network.text_575')" v-bind="formItemLayout" :validate-status="guestIpPrefixValidateStatus" :help="guestIpPrefixHelp" required v-if="isGroupGuestIpPrefix">
        <template slot="extra">
          <div>{{$t('network.text_578')}}</div>
          <div>{{$t('network.text_580')}}</div>
        </template>
        <div class="d-flex" v-for="(item, i) in guestIpPrefix" :key="item.key">
          <a-form-item>
            <a-input style="width: 400px" v-decorator="decorators.guest_ip_prefix(i)" :placeholder="$t('network.text_581')" />
          </a-form-item>
          <a-button shape="circle" icon="minus" size="small" v-if="guestIpPrefix.length > 1" @click="decrease(i)" class="mt-2 ml-2" />
        </div>
        <div class="d-flex align-items-center" v-if="remain > 0">
          <a-button type="primary" shape="circle" icon="plus" size="small" @click="addGuestIpPrefix" />
          <a-button type="link" @click="addGuestIpPrefix">{{$t('network.text_582')}}</a-button>
          <span class="count-tips">{{$t('network.text_169')}}<span class="remain-num">{{ remain }}</span>{{$t('network.text_170')}}</span>
        </div>
      </a-form-item>
      <a-form-item :label="$t('common_498')" v-if="isShowIsAutoAlloc">
        <a-switch v-decorator="decorators.is_auto_alloc" />
        <template slot="extra">{{$t('common_500')}}</template>
      </a-form-item>
      <a-collapse :bordered="false"  v-if="show">
        <a-collapse-panel :header="$t('network.text_94')" key="1" forceRender>
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
          <a-form-item :label="$t('network.text_585')" v-bind="formItemLayout">
            <a-input :placeholder="$t('validator.IPv4')" v-decorator="decorators.guest_dns" />
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
        </a-collapse-panel>
      </a-collapse>
      <page-footer>
        <template v-slot:right>
          <a-button type="primary" html-type="submit" class="ml-3" :loading="submiting" size="large">{{$t('network.text_30')}}</a-button>
          <a-button class="ml-3" size="large" @click="() => $router.back()">{{$t('common.cancel')}}</a-button>
        </template>
      </page-footer>
    </a-form>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import IpSubnets from './components/IpSubnets'
import { isRequired, REGEXP } from '@/utils/validate'
import { Manager } from '@/utils/manager'
import { uuid } from '@/utils/utils'
import { typeClouds, getCloudEnvOptions } from '@/utils/common/hypervisor'
import DomainProject from '@/sections/DomainProject'
import AreaSelects from '@/sections/AreaSelects'
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

export default {
  name: 'NetworkCreate',
  components: {
    IpSubnets,
    DomainProject,
    AreaSelects,
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
    return {
      submiting: false,
      cloudEnvOptions,
      cloudEnv,
      routerQuery,
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.handleValuesChange }),
        fd: {},
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
              { validator: this.$validate('IPv4', false) },
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
        ipSubnets: {
          startip: i => [
            `startip[${i}]`,
            {
              initialValue: '',
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('network.text_593') },
                { validator: this.$validate('IPv4') },
              ],
            },
          ],
          endip: i => [
            `endip[${i}]`,
            {
              initialValue: '',
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('network.text_594') },
                { validator: this.$validate('IPv4') },
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
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_597') },
              { validator: this.validatePublicIpPrefix },
            ],
          },
        ],
        is_auto_alloc: ['is_auto_alloc', {
          valuePropName: 'checked',
        }],
      },
      serverTypeOpts: [
        { label: this.$t('network.text_226'), key: 'guest' },
        { label: this.$t('network.text_598'), key: 'baremetal' },
        // { label: this.$t('network.text_599'), key: 'container' },
        { label: 'PXE', key: 'pxe' },
        { label: 'IPMI', key: 'ipmi' },
        { label: this.$t('network.text_221'), key: 'eip' },
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
      guestIpPrefix: [{ key: uuid() }],
      zoneList: [],
      project_domain: '',
      vpcId: '',
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
    remain () {
      const remain = 6 - this.guestIpPrefix.length
      return Math.max(remain, 0)
    },
    vpcParams () {
      const params = {
        show_emulated: true,
        limit: 0,
        usable_vpc: true,
        scope: this.scope,
        cloudregion_id: this.regionId,
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
        usable_vpc: true,
        show_emulated: true,
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
      return ['city', 'provider', 'cloudregion']
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
  },
  created () {
    this.initState()
  },
  methods: {
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
    },
    decrease (index) {
      this.guestIpPrefix.splice(index, 1)
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
      if (this.cloudEnv === 'onpremise') {
        if (vpcId !== 'default') {
          this.isGroupGuestIpPrefix = true
          this.show = false
        } else {
          this.isGroupGuestIpPrefix = false
          this.show = true
          this.form.fc.setFieldsValue({
            server_type: 'guest',
          })
        }
      }
    },
    vpcLabelFormat (item) {
      if (item.manager) {
        if (item.cidr_block) {
          return (<div>{ item.name }<span v-if="item.cidr_block">（{ item.cidr_block }）</span><span class="ml-2 text-color-secondary">{ this.$t('common.cloudprovider_1var', [item.manager]) }</span></div>)
        }
        return (<div>{ item.name }<span class="ml-2 text-color-secondary">{ this.$t('common.cloudprovider_1var', [item.manager]) }</span></div>)
      }
      return (<div>{ item.name }</div>)
    },
    validatePublicIpPrefix (rule, value, callback) {
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
      if (this.cloudEnv === 'onpremise') {
        const data = []
        if (this.isGroupGuestIpPrefix) {
          R.forEachObjIndexed((value, key) => {
            const obj = {
              guest_ip_prefix: value,
              name: values.name,
              vpc: values.vpc,
              zone: values.zone,
              project_id: values.project.key,
              is_auto_alloc: values.is_auto_alloc,
            }
            data.push(obj)
          }, values.guest_ip_prefix)
        } else {
          R.forEachObjIndexed((value, key) => {
            const obj = {
              alloc_policy: values.alloc_policy,
              guest_dns: values.guest_dns,
              guest_domain: values.guest_domain,
              guest_gateway: values.gateway[key],
              guest_ip_end: values.endip[key],
              guest_ip_mask: values.netmask[key],
              guest_ip_start: values.startip[key],
              vlan_id: values.vlan[key] === '' ? '1' : values.vlan[key],
              name: values.name,
              project_id: values.project.key,
              server_type: values.server_type,
              wire_id: values.wire,
            }
            data.push(obj)
          }, values.startip)
        }
        return data
      }
      if (this.regionProvider === typeClouds.providerMap.ZStack.key) {
        return {
          project_id: values.project.key,
          guest_ip_prefix: values.guest_ip_prefix[0],
          name: values.name,
          wire_id: values.wire,
          is_auto_alloc: values.is_auto_alloc,
        }
      }
      return {
        project_id: values.project.key,
        guest_ip_prefix: values.guest_ip_prefix[0],
        name: values.name,
        vpc: values.vpc,
        zone: values.zone,
        is_auto_alloc: values.is_auto_alloc,
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
        console.log(values)
        this.submiting = true
        if (this.cloudEnv === 'onpremise' && !this.isGroupGuestIpPrefix && (R.isNil(values.startip) || R.isEmpty(values.startip))) {
          this.ipSubnetsValidateStatus = 'error'
          this.ipSubnetsHelp = this.$t('network.text_605')
          return
        }
        if (this.isGroupGuestIpPrefix && (R.isNil(values.guest_ip_prefix) || R.isEmpty(values.guest_ip_prefix))) {
          this.guestIpPrefixValidateStatus = 'error'
          this.guestIpPrefixHelp = this.$t('network.text_605')
          return
        }
        const data = this.genData(values)
        const manager = new Manager('networks')
        if (this.cloudEnv === 'onpremise') {
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
      } catch (error) {
        throw error
      } finally {
        this.submiting = false
      }
    },
  },
}
</script>
