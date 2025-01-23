<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_390')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.text_390')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_106')" class="mb-0">
          <a-row :gutter="20">
            <a-col :span="14">
              <a-form-item :help="help">
                <base-select
                  class="w-100"
                  v-decorator="decorators.network"
                  resource="networks"
                  :params="networkParams"
                  :item.sync="form.fi.network"
                  remote
                  :label-format="item => `${item.name}(${item.guest_ip_start} - ${item.guest_ip_end}, vlan=${item.vlan_id})`"
                  :remote-fn="q => ({ filter: `name.contains(${q})` })"
                  :select-props="{ placeholder: $t('compute.text_195') }"
                  :mapper="mapper" />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item>
                <ip-select v-decorator="decorators.ip" :value="form.fi.ip" :network="form.fi.network" @change="ipChange" />
              </a-form-item>
            </a-col>
            <a-col :span="10" v-if="isSupportIPv6">
              <a-form-item>
                <div class="d-flex">
                  <a-checkbox v-model="hasIpv6" style="display:inline-block;min-width:200px" @change="requireIpv6Change">{{ $t('compute.server_create.require_ipv6') }}</a-checkbox>
                  <template v-if="isSupportIPv6 && ipv6ConfigShow">
                    <template v-if="ipv6InputShow">
                      <div class="mb-0 ml-1" style="display:flex">
                        <span class="mr-1">{{ getIpv6Prefix(form.fi.network?.guest_ip6_start) }}</span>
                        <a-form-item class="mb-0" style="display:inline-block">
                          <a-input
                            style="width: 164px"
                            :placeholder="$t('compute.complete_ipv6_address')"
                            v-decorator="decorators.address6" />
                        </a-form-item>
                        <a-button type="link" class="mt-1" @click="triggerShowIpv6">{{$t('compute.text_135')}}</a-button>
                      </div>
                    </template>
                    <a-button v-else type="link" class="mt-1" @click="triggerShowIpv6">{{$t('compute.ipv6_config')}}</a-button>
                  </template>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item>
          <a-checkbox v-decorator="decorators.restartNetwork">{{$t('compute.restart_network')}}</a-checkbox>
          <help-tooltip name="restartNetworkToEffectIp" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ipaddr from 'ipaddr.js'
import IpSelect from '@Compute/sections/ServerNetwork/IpSelect'
import { validate, isWithinRange } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'
import expectStatus from '@/constants/expectStatus'
import { getIpv6Start, ipv6ToHex } from '@Compute/utils/createServer'

export default {
  name: 'VmChangeIpDialog',
  components: {
    IpSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const validateIp = (rule, value, callback) => {
      let msg
      if (!R.isNil(value) && !R.isEmpty(value)) {
        if (R.isEmpty(this.form.fi.network)) {
          msg = this.$t('compute.text_1191')
          return callback(msg)
        }
        if (validate(value, 'IPv4') !== true) {
          msg = this.$t('compute.text_1192')
          return callback(msg)
        }
        if (!isWithinRange(value, this.form.fi.network.guest_ip_start, this.form.fi.network.guest_ip_end)) {
          msg = this.$t('compute.text_1193')
          return callback(msg)
        }
      }
      return callback()
    }
    const validateIpv6 = (rule, value, cb) => {
      const networkData = this.form.fi.network
      const ipv6First = getIpv6Start(networkData.guest_ip6_start)
      try {
        const ipv6 = ipv6First + value
        const ipAddr = ipaddr.IPv6.parse(ipv6)
        const subnet1Addr = ipaddr.IPv6.parse(networkData.guest_ip6_start)
        const subnet2Addr = ipaddr.IPv6.parse(networkData.guest_ip6_end)

        if (ipAddr.kind() !== 'ipv6') {
          cb(new Error(this.$t('compute.error_ipv6')))
        }
        const target = ipv6ToHex(ipAddr)
        const start = ipv6ToHex(subnet1Addr)
        const end = ipv6ToHex(subnet2Addr)
        // 检查IP是否在两个子网之间
        if (!((target >= start && target <= end))) {
          cb(new Error(this.$t('compute.ipv6_within_range')))
        }
        cb()
      } catch (err) {
        cb(new Error(this.$t('compute.error_ipv6')))
      }
    }
    let hasIpv6 = false
    let initIpv6Value = ''
    if (this.params.data[0].ip6_addr) {
      hasIpv6 = true
      initIpv6Value = this.getIpv6Value(this.params.data[0].ip6_addr)
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fi: {
          network: {},
          ip: this.params.data[0].ip_addr,
        },
      },
      hasIpv6,
      decorators: {
        network: [
          'network',
          {
            initialValue: this.params.data[0].network_id,
            rules: [
              { required: true, message: this.$t('compute.text_1191') },
            ],
          },
        ],
        ip: [
          'ip',
          {
            initialValue: this.params.data[0].ip_addr,
            rules: [
              { message: this.$t('common.tips.select', ['IP']), validator: validateIp },
            ],
          },
        ],
        address6: [
          'address6',
          {
            initialValue: initIpv6Value,
            validateFirst: true,
            validateTrigger: ['blur', 'change'],
            rules: [
              {
                required: true,
                message: this.$t('compute.complete_ipv6_address'),
              },
              {
                validator: validateIpv6,
              },
            ],
          },
        ],
        restartNetwork: [
          'restartNetwork',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      ipv6ConfigShow: hasIpv6,
      ipv6InputShow: hasIpv6,
    }
  },
  computed: {
    ...mapGetters(['scope']),
    networkParams () {
      const params = {
        zone: this.params.zone,
        scope: this.scope,
        wire: this.params.data[0].wire_id,
        filter: 'server_type.notin(ipmi, pxe)',
      }
      if (this.params.hypervisor === HYPERVISORS_MAP.esxi.key) {
        params.vpc_id = 'default'
      }
      return params
    },
    columns () {
      const showFields = ['ifname', 'ip_addr', 'mac_addr']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
    help () {
      if (this.params.hypervisor === HYPERVISORS_MAP.esxi.key) {
        return this.$t('compute.text_1194')
      }
      return ''
    },
    isSupportIPv6 () {
      return !!this.form.fi.network.guest_ip6_start && !!this.form.fi.network.guest_ip6_end
    },
  },
  methods: {
    ipChange (e) {
      this.form.fi.ip = e
    },
    requireIpv6Change (e) {
      this.ipv6ConfigShow = e.target.checked
    },
    triggerShowIpv6 () {
      this.ipv6InputShow = !this.ipv6InputShow
    },
    getIpv6Prefix (ipv6 = '') {
      if (ipv6) {
        const list = ipaddr.parse(ipv6).toNormalizedString().split(':')
        return list.slice(0, 4).join(':') + ':'
      }
      return ''
    },
    getIpv6Value (ipv6 = '') {
      if (ipv6) {
        const list = ipaddr.parse(ipv6).toNormalizedString().split(':')
        return list.slice(4, 8).join(':')
      }
      return ''
    },
    async handleConfirm () {
      this.loading = true
      let manager = new this.$Manager('servers')
      const values = await this.form.fc.validateFields()
      const net_desc = {}
      if (values.network) {
        net_desc.network = values.network
      }
      if (values.ip) {
        net_desc.address = values.ip
      }
      if (this.hasIpv6) {
        net_desc.require_ipv6 = true
      }
      const address6 = values.address6
      if (address6) {
        const ipv6Last = address6
        const target = this.form.fi.network
        const ipv6First = getIpv6Start(target?.guest_ip6_start)
        net_desc.address6 = ipv6First + ipv6Last
      }
      try {
        const data = {
          ip_addr: this.params.data[0].ip_addr,
          net_desc,
          restart_network: values.restartNetwork,
        }
        await manager.performAction({
          id: this.params.resId,
          action: 'change-ipaddr',
          data,
        })
        this.params.refresh()
        this.$bus.$emit('VMInstanceListSingleRefresh', [this.params.resId, Object.values(expectStatus.server).flat()])
        this.cancelDialog()
        this.$message.success(this.$t('compute.text_423'))
      } finally {
        this.loading = false
        manager = null
      }
    },
    mapper (list) {
      return list.sort((a, b) => { return (b.ports - b.ports_used) - (a.ports - a.ports_used) })
    },
  },
}
</script>
