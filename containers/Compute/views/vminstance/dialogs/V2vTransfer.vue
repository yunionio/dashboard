<template>
  <base-dialog class="v2vtransfer-dialog" @cancel="cancelDialog" :width="1300">
    <div slot="header">{{$t('compute.v2vtransfer.label')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.v2vtransfer.label')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.v2vtransfer.type')">
          <a-radio v-decorator="decorators.type">{{ $t('compute.v2vtransfer.kvm') }} <help-tooltip name="v2vTransferType" /></a-radio>
        </a-form-item>
        <a-form-item :label="$t('dictionary.project')">
          <domain-project
            :decorators="decorators.projectDomain"
            :fc="form.fc"
            :labelInValue="false" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_177')" class="mb-0">
          <cloudregion-zone
            :zone-params="zoneParams"
            :cloudregion-params="cloudregionParams"
            :decorator="decorators.cloudregionZone"
            :disabledRegion="true"
            filterBrandResource="compute_engine" />
        </a-form-item>
        <a-form-item :label="$t('compute.network_mode')">
          <a-radio-group v-decorator="decorators.network_mode" @change="networkModeHandle">
            <a-radio-button value="old">{{$t('compute.network_mode.old')}}<help-tooltip class="ml-1" :text="$t('compute.network_mode.old_tips')" /></a-radio-button>
            <a-tooltip :title="networkModeTooltips">
              <a-radio-button value="new" :disabled="networkModeTooltips">{{$t('compute.network_mode.new')}}</a-radio-button>
            </a-tooltip>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="!isNetworkModeNew" :label="$t('compute.network_check_result')">
          <a-spin v-if="networkCheckLoading">
            <a-icon slot="indicator" type="loading" spin />
          </a-spin>
          <span v-else>
            <span v-if="checkNetworkResultSuccess" class="success">{{$t('compute.network_check_result.success')}}</span>
            <span v-else class="error">
              {{$t('compute.network_check_result.error')}}
              <a-icon type="sync" class="mr-2 pointer" :spin="spinLoading" @click="networkCheckHandle" />
              <help-link :href="href">{{$t('compute.network_check_result.new_create')}}</help-link>
            </span>
          </span>
        </a-form-item>
        <a-form-item v-if="isNetworkModeNew" :label="$t('compute.text_104')" class="mb-0">
          <server-network
            :form="form"
            :decorator="decorators.network"
            :network-resource-mapper="networkResourceMapper"
            :network-list-params="networkParams"
            :schedtag-params="resourcesParams.schedtag"
            :vpcResource="vpcResource"
            :networkVpcParams="resourcesParams.vpcParams"
            :showMacConfig="firstData.hypervisor === 'kvm'"
            :showDeviceConfig="firstData.hypervisor === 'kvm'"
            :isDialog="true"
            :hiddenNetworkOptions="['default', 'schedtag']"
            defaultNetworkType="manual"
            :hiddenAdd="true" />
        </a-form-item>
        <a-form-item
          :label="$t('compute.text_111')"
          :validate-status="message ? 'warning' : hostValidateStatus"
          :help="message || hostValidateMsg">
          <list-select
            v-decorator="decorators.host"
            :list-props="resourceProps"
            :formatter="v => v.name"
            :multiple="false"
            :placeholder="$t('compute.text_314')"
            :dialog-params="{ title: $t('compute.text_111'), width: 1060 }"
            @change="hostChangeHandle" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-tooltip :title="handleConfirmDisabledTooltip">
        <a-button type="primary" @click="handleConfirm" :loading="loading" :disabled="handleConfirmDisabled">{{ $t('dialog.ok') }}</a-button>
      </a-tooltip>
      <a-button class="ml-2" @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import { typeClouds } from '@/utils/common/hypervisor'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ListSelect from '@/sections/ListSelect'
import DomainProject from '@/sections/DomainProject'
import CloudregionZone from '@/sections/CloudregionZone'
import validateForm, { isRequired, isWithinRange } from '@/utils/validate'
import { checkIpV6, getIpv6Start } from '@Compute/utils/createServer'
import ResourceProps from '../mixins/resourceProps'

export default {
  name: 'VmV2vTransferDialog',
  provide () {
    return {
      form: this.form,
    }
  },
  components: {
    ListSelect,
    DomainProject,
    ServerNetwork,
    CloudregionZone,
  },
  mixins: [DialogMixin, WindowsMixin, ResourceProps],
  data () {
    const firstData = this.params.data[0]

    const checkIpInSegment = (i, networkData) => {
      return (rule, value, cb) => {
        const isIn = isWithinRange(value, networkData.guest_ip_start, networkData.guest_ip_end)
        if (isIn) {
          cb()
        } else {
          cb(new Error(this.$t('compute.text_205')))
        }
      }
    }

    return {
      loading: false,
      networkCheckLoading: false,
      spinLoading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
        fi: {
          capability: {},
        },
      },
      hosts: [],
      message: '',
      decorators: {
        type: [
          'type',
          {
            initialValue: true,
            valuePropName: 'checked',
          },
        ],
        projectDomain: {
          domain: [
            'domain',
            {
              initialValue: firstData.domain_id,
            },
          ],
          project: [
            'project',
            {
              initialValue: firstData.tenant_id,
            },
          ],
        },
        cloudregionZone: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: this.$t('compute.text_212') },
              ],
            },
          ],
          zone: [
            'zone',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: this.$t('compute.text_213') },
              ],
            },
          ],
        },
        host: [
          'host',
          {
            rules: [
              { required: false, message: this.$t('compute.text_314'), trigger: 'change' },
            ],
          },
        ],
        network: {
          networkType: [
            'networkType',
            {
              initialValue: NETWORK_OPTIONS_MAP.default.key,
            },
          ],
          networkConfig: {
            vpcs: i => [
              `vpcs[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_194'),
                }],
              },
            ],
            networks: i => [
              `networks[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_217'),
                }],
              },
            ],
            ips: (i, networkData) => [
              `networkIps[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    required: true,
                    message: this.$t('compute.text_218'),
                  },
                  {
                    validator: validateForm('IPv4'),
                  },
                  {
                    validator: checkIpInSegment(i, networkData),
                  },
                ],
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
            macs: (i, networkData) => [
              `networkMacs[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    required: true,
                    message: this.$t('compute.text_806'),
                  },
                  {
                    validator: validateForm('mac'),
                  },
                ],
              },
            ],
            ipv6s: (i, networkData) => [
              `networkIPv6s[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
              },
            ],
            devices: i => [
              `networkDevices[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.sriov_device_tips'),
                }],
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
                  message: this.$t('compute.text_123'),
                }],
              },
            ],
            policys: (i, networkData) => [
              `networkPolicys[${i}]`,
              {
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: this.$t('common_256'),
                }],
              },
            ],
            devices: i => [
              `networkDevices[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.sriov_device_tips'),
                }],
              },
            ],
          },
        },
        schedPolicy: {
          schedPolicyType: [
            'schedPolicyType',
            {
              initialValue: 'default',
            },
          ],
          schedPolicyHost: [
            'schedPolicyHost',
            {
              rules: [
                { required: true, message: this.$t('compute.text_219') },
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
                  message: this.$t('compute.text_123'),
                }],
              },
            ],
            policys: (i, networkData) => [
              `policySchedtagPolicys[${i}]`,
              {
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: this.$t('common_256'),
                }],
              },
            ],
          },
        },
        network_mode: [
          'network_mode',
          {
            initialValue: 'old',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      checkNetworkResultSuccess: false,
    }
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode']),
    firstData () {
      return this.params.data[0]
    },
    isSingle () {
      return this.params.data.length === 1
    },
    hostsParams () {
      const hostIds = this.forcastData?.filtered_candidates?.map(v => v.id) || []
      const { domain, zone } = this.form.fd
      const ret = {
        scope: this.scope,
        limit: 10,
        enabled: 1,
        host_status: 'online',
        brand: typeClouds.brandMap.OneCloud.brand,
        os_arch: this.firstData.os_arch,
        project_domain: domain,
      }
      if (hostIds && hostIds.length > 0) {
        ret.filter = `id.notin(${hostIds.join(',')})`
      }
      if (zone) {
        ret.zone = zone.key
      }
      return ret
    },
    hostsOptions () {
      const hostIds = this.forcastData?.filtered_candidates?.map(v => v.id) || []
      if (this.forcastData?.can_create === false) {
        return []
      }
      return this.hosts.filter(v => {
        return !hostIds.includes(v.id) && v.id !== this.firstData.host_id
      }).map(v => {
        return {
          key: v.id,
          label: v.name,
        }
      })
    },
    hostValidateStatus () {
      if (this.forcastData && this.hostsOptions?.length === 0) {
        return 'error'
      }
      return 'success'
    },
    hostValidateMsg () {
      if (this.forcastData && this.hostsOptions?.length === 0) {
        return this.$t('compute.transfer_host')
      }
      return this.$t('compute.v2v_transfer.host_tooltip')
    },
    columns () {
      const fields = ['name', 'status', 'host', 'ips', 'region', 'tenant']
      const columnsMap = {}
      this.params.columns.forEach(item => {
        const { field } = item
        if (fields.indexOf(field) > -1) {
          columnsMap[field] = item
        }
      })
      return fields.map(field => {
        return columnsMap[field]
      })
    },
    networkParams () {
      const ret = {
        scope: this.scope,
        usable: true,
        brand: typeClouds.brandMap.OneCloud.brand,
      }
      const { domain, zone } = this.form.fd
      if (domain) {
        ret.project_domain = domain
      }
      if (zone) {
        ret.zone = zone.key
      }
      return ret
    },
    vpcResource () {
      const { cloudregion } = this.form.fd
      if (!cloudregion) return ''
      return `cloudregions/${cloudregion.key}/vpcs`
    },
    resourcesParams () {
      const schedtag = {
        limit: 1024,
        'filter.0': 'resource_type.equals(networks)',
      }
      const vpcParams = {
        limit: 0,
        usable: true,
        brand: typeClouds.brandMap.OneCloud.brand,
      }
      const { domain, zone } = this.form.fd
      if (domain) {
        vpcParams.project_domain = domain
      }
      if (zone) {
        vpcParams.zone_id = zone.key
      }
      return {
        schedtag,
        vpcParams,
      }
    },
    cloudregionParams () {
      return {
        cloud_env: 'onpremise',
        usable: true,
        show_emulated: true,
        scope: this.scope,
      }
    },
    zoneParams () {
      return {
        usable: true,
        show_emulated: true,
        order_by: 'created_at',
        order: 'asc',
        scope: this.scope,
      }
    },
    isNetworkModeNew () {
      return this.form.fd.network_mode === 'new'
    },
    href () {
      const url = this.$router.resolve('/network2')
      return url.href
    },
    networkModeTooltips () {
      if (!this.isSingle) {
        return this.$t('compute.network_mode.new_tips')
      }
      return undefined
    },
    isDisabledCreate () {
      if (this.isNetworkModeNew) return false
      return !this.checkNetworkResultSuccess
    },
    handleConfirmDisabled () {
      if (this.isDisabledCreate) return this.isDisabledCreate
      return this.forcastData && this.hostsOptions?.length === 0
    },
    handleConfirmDisabledTooltip () {
      if (this.isDisabledCreate) {
        return this.$t('compute.network_check_result.error')
      }
      return ''
    },
  },
  watch: {
    'form.fd.zone' (newV, oldV) {
      if (newV?.key && (newV.key !== oldV.key)) {
        this.capability(newV.key)
      }
    },
  },
  created () {
    this.capability = _.debounce(this._capability, 1000)
    this.queryData()
  },
  methods: {
    networkModeHandle (e) {
      if (e.target.value === 'new') {
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({
            networkType: NETWORK_OPTIONS_MAP.manual.key,
          })
        })
      }
    },
    networkCheckHandle () {
      this.spinLoading = true
      this.batchConvertPrecheck()
      setTimeout(() => {
        this.spinLoading = false
      }, 2000)
    },
    queryData () {
      this.queryHosts()
      this.batchConvertPrecheck()
    },
    _capability (zoneId) { // 可用区查询
      const data = { show_emulated: true, scope: this.scope }
      const m = new this.$Manager('zones')
      m.get({
        id: `${zoneId}/capability`,
        params: data,
      }).then(({ data = {} }) => {
        this.form.fi.capability = {
          ...data,
        }
      })
    },
    networkResourceMapper (list) {
      return list
        .map(val => {
          const remain = val.ports - val.ports_used
          if (remain <= 0) {
            return {
              ...val,
              __disabled: true,
            }
          }
          return val
        })
        .sort((a, b) => (b.ports - b.ports_used) - (a.ports - a.ports_used))
    },
    /**
   * 组装网络数据
   *
   * @returns { Array }
   * @memberof GenCreateData
   */
    async genNetworks (values) {
      let ret = [{ exit: false }]
      // 指定 IP 子网
      if (this.form.fd.networkType === NETWORK_OPTIONS_MAP.manual.key) {
        ret = []
        const { networkIPv6s, networkIpsAddress6 } = await this.form.fc.validateFields()
        R.forEachObjIndexed((value, key) => {
          const obj = {
            network: value,
          }
          if (this.form.fd.networkIps) {
            const address = this.form.fd.networkIps[key]
            if (address) {
              obj.address = address
            }
          }
          if (this.form.fd.networkMacs) {
            const mac = this.form.fd.networkMacs[key]
            if (mac) {
              obj.mac = mac
            }
          }
          if (networkIPv6s && networkIPv6s[key]) {
            obj.require_ipv6 = true
          }
          if (networkIpsAddress6 && networkIpsAddress6[key]) {
            const ipv6Last = networkIpsAddress6[key]
            const target = this.form.fi.networkList.filter(item => item.key === key)
            const ipv6First = getIpv6Start(target[0]?.network?.guest_ip6_start)
            obj.address6 = ipv6First + ipv6Last
          }
          if (this.form.fd.networkExits) {
            const exit = this.form.fd.networkExits[key]
            if (exit) {
              obj.exit = true
            }
          }
          if (this.form.fd.networkDevices) {
            const device = this.form.fd.networkDevices[key]
            if (device) {
              obj.sriov_device = { model: device }
            }
          }
          ret.push(obj)
        }, values.networks)
      }
      // 指定 调度标签
      if (this.form.fd.networkType === NETWORK_OPTIONS_MAP.schedtag.key) {
        ret = []
        R.forEachObjIndexed((value, key) => {
          const obj = {
            id: value,
          }
          const strategy = this.form.fd.networkPolicys[key]
          if (strategy) {
            obj.strategy = strategy
          }
          if (this.form.fd.networkDevices) {
            const device = this.form.fd.networkDevices[key]
            if (device) {
              obj.sriov_device = { model: device }
            }
          }
          ret.push({
            schedtags: [obj],
          })
        }, values.networkSchedtags)
      }
      return ret
    },
    async doTransfer (ids, values) {
      const data = {
        prefer_host: values.host,
        target_hypervisor: this.firstData.hypervisor,
      }
      if (this.isNetworkModeNew) {
        data.networks = await this.genNetworks(values)
      }
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'convert-to-kvm',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.doTransfer(ids, values)
        this.$message.success(this.$t('common.success'))
        this.params.successCallback && this.params.successCallback()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    queryHosts () {
      const hostsManager = new this.$Manager('hosts')
      hostsManager.list({ params: this.hostsParams }).then((res) => {
        this.hosts = res.data.data || []
      }).catch((err) => {
        console.log(err)
        throw err
      })
    },
    hostChangeHandle (hostId) {
      const hostArr = this.params.data.filter(v => v.host_id === hostId)
      if (hostArr.length > 0) {
        this.message = this.$t('compute.transfer_mutiple_dialog_alert', [hostArr.length])
      } else {
        this.message = ''
      }
    },
    async batchConvertPrecheck () {
      try {
        this.checkNetworkResultSuccess = false
        this.networkCheckLoading = true
        const ids = this.params.data.map(item => item.id)
        const m = new this.$Manager('servers')
        const res = await m.performClassAction({ action: 'batch-convert-precheck', data: { guest_ids: ids } })

        if (!res.data?.network_failed) {
          this.checkNetworkResultSuccess = true
        }
      } catch (error) {
        throw error
      } finally {
        this.networkCheckLoading = false
      }
    },
  },
}
</script>

<style lang="scss">
.v2vtransfer-dialog .ant-col-20 {
  width: 83%;
  .success {
    color: #0cbd09;
  }
  .error {
    color: #f00b0b;
  }
  .pointer {
    cursor: pointer;
  }
}
</style>
