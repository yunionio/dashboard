<template>
  <base-dialog @cancel="cancelDialog" :width="1300">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <!-- <a-alert class="mb-2" type="warning" :message="message" /> -->
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_199')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc">
        <network-config
          :form="form"
          :count="params.total"
          :decorator="networkConfig"
          :networkParams="networkParams"
          :limit="networkLimit"
          :networkLimit="networkLimit"
          :vpcParams="vpcParams"
          :vpcResource="vpcResource"
          :vpcObj="vpcObj"
          :is-dialog="true"
          :showMacConfig="isKvm"
          :showDeviceConfig="isKvm"
          :showSecgroupConfig="isKvm" />
      </a-form>
      <a-form-item>
        <a-checkbox v-model="syncConfigImmediately">
          {{ $t('compute.nics.sync_config_immediately') }}
        </a-checkbox>
      </a-form-item>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>
<script>
import * as R from 'ramda'
import { HYPERVISORS_MAP } from '@/constants'
import NetworkConfig from '@Compute/sections/ServerNetwork/NetworkConfig'
import { checkIpInSegment, checkIpV6, getIpv6Start } from '@Compute/utils/createServer'
import expectStatus from '@/constants/expectStatus'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm from '@/utils/validate'
import { typeClouds } from '@/utils/common/hypervisor'

const hypervisorMap = typeClouds.hypervisorMap

export default {
  name: 'VmSetNetworkDialog',
  components: {
    NetworkConfig,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fi: {
          capability: {}, // 可用区下的可用资源
        },
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      secgroupsInitLoaded: false,
      bindedSecgroups: [],
      bindedSecgroupsLoaded: false,
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
                validator: this.$validate('IPv4'),
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
        ipv6_mode: (i, networkData) => [
          `networkIPv6Modes[${i}]`,
          {
            validateTrigger: ['change', 'blur'],
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
        secgroups: (i, networkData) => [
          `networkSecgroups[${i}]`,
          {
            validateTrigger: ['change', 'blur'],
            rules: [{
              required: true,
              message: this.$t('compute.text_193'),
            }],
          },
        ],
      },
      vpcObj: {
        id: this.params.data[0].vpc_id,
        name: this.params.data[0].vpc,
      },
      syncConfigImmediately: true,
    }
  },
  computed: {
    networkParams () {
      const { data } = this.params
      const resItem = data && data.length > 0 ? data[0] : {}
      const params = {
        filter: 'server_type.notin(ipmi, pxe, eip)',
        usable: true,
        cloudregion: resItem.cloudregion_id,
        zone: resItem.zone_id,
        // host: resItem.host,
        scope: this.$store.getters.scope,
        host_type: 'hypervisor',
      }
      if ([HYPERVISORS_MAP.esxi.key].includes(resItem.hypervisor)) {
        params.host_type = 'esxi'
      }
      return params
    },
    networkLimit () {
      return 8 - (this.params.total || 0)
    },
    vpcParams () {
      const scopeParams = {}
      if (this.$store.getters.isAdminMode) {
        scopeParams.project_domain = this.params.data[0].domain_id
      } else {
        scopeParams.scope = this.$store.getters.scope
      }
      const params = {
        usable: true,
        limit: 0,
        show_emulated: true,
        ...scopeParams,
      }
      return params
    },
    vpcResource () {
      return `cloudregions/${this.params.data[0].cloudregion_id}/vpcs`
    },
    curResData () {
      return this.params.data[0]
    },
    isKvm () {
      return this.curResData.hypervisor === hypervisorMap.kvm.key
    },
  },
  created () {
    this.fetchCapability()
  },
  methods: {
    fetchCapability () {
      const params = {
        show_emulated: true,
        resource_type: 'shared',
      }
      let id = this.curResData.cloudregion
      let resource = 'cloudregions'
      if (this.curResData.zone) {
        id = this.curResData.zone
        resource = 'zones'
      }
      const capabilityParams = { id, spec: 'capability', params }
      if (!id) return
      if (R.equals(this.capabilityParams, capabilityParams)) return // 和已有的参数一样则不发请求
      this.capabilityParams = capabilityParams
      new this.$Manager(resource).getSpecific(this.capabilityParams)
        .then(({ data }) => {
          this.form.fi.capability = {
            ...data,
          }
        })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const nets = []
        const { networks, networkIps, networkMacs, networkIPv6s, networkDevices, networkIpsAddress6, networkIPv6Modes, networkSecgroups } = await this.form.fc.validateFields()
        if (!networks || R.isEmpty(networks)) {
          this.cancelDialog()
          return false
        }
        for (const key in networks) {
          const o = {
            network: networks[key],
          }
          if (networkIps && networkIps[key]) {
            o.address = networkIps[key]
          }
          if (networkMacs && networkMacs[key]) {
            o.mac = networkMacs[key]
          }
          if (networkIPv6s && networkIPv6s[key]) {
            o.require_ipv6 = true
          }
          const target = this.form.fi.networkList.filter(item => item.key === key)
          if (networkIpsAddress6 && networkIpsAddress6[key]) {
            const ipv6Last = networkIpsAddress6[key]
            const ipv6First = getIpv6Start(target[0]?.network?.guest_ip6_start)
            o.address6 = ipv6First + ipv6Last
          }
          if (o.require_ipv6) {
            if (networkIPv6Modes && networkIPv6Modes[key] === 'only') {
              o.strict_ipv6 = true
            }
          }
          if (!target[0]?.network?.guest_ip_start && !target[0]?.network?.guest_ip_end && target[0]?.network?.guest_ip6_start) {
            o.strict_ipv6 = true
          }
          if (networkDevices && networkDevices[key]) {
            o.sriov_device = {
              model: networkDevices[key],
            }
          }
          if (networkSecgroups && networkSecgroups[key]) {
            o.secgroups = networkSecgroups[key]
          }
          nets.push(o)
        }
        const manager = new this.$Manager('servers')
        await manager.performAction({
          id: this.params.data[0].id,
          action: 'attachnetwork',
          data: {
            disable_sync_config: !this.syncConfigImmediately,
            nets,
          },
        })
        this.params.refresh()
        this.$bus.$emit('VMInstanceListSingleRefresh', [this.params.resId, Object.values(expectStatus.server).flat()])
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .network-item {
  width: 260px;
}
</style>
