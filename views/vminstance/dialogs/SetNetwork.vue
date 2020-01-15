<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.data.title}}</div>
    <div slot="body">
      <!-- <a-alert class="mb-2" type="warning" :message="message" /> -->
      <dialog-selected-tips :count="params.data.length" action="添加网卡" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc">
        <network-config :form="form.fc" :decorator="networkConfig" :networkParams="networkParams" :limit= "networkLimit" />
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
import NetworkConfig from '@Compute/sections/ServerNetwork/NetworkConfig'
import { checkIpInSegment } from '@Compute/utils/createServer'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

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
        networks: i => [
          `networks[${i}]`,
          {
            validateTrigger: ['change', 'blur'],
            rules: [{
              required: true,
              message: '请选择ip子网',
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
              message: '请输入ip',
            }, {
              validator: checkIpInSegment(i, networkData),
            }],
          },
        ],
      },
    }
  },
  computed: {
    networkParams () {
      const { data } = this.params.data[0]
      const resItem = data && data.length > 0 ? data[0] : {}
      return {
        filter: 'server_type.notin(ipmi, pxe)',
        usable: true,
        cloudregion: resItem.cloudregion_id,
        zone: resItem.zone_id,
      }
    },
    networkLimit () {
      return 8 - (this.params.list.total || 0)
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const nets = []
        const { networks, networkIps } = await this.form.fc.validateFields()
        if (!networks || R.isEmpty(networks)) {
          this.cancelDialog()
          return false
        }
        for (let key in networks) {
          let o = {
            network: networks[key],
          }
          if (networkIps && networkIps[key]) {
            o['address'] = networkIps[key]
          }
          nets.push(o)
        }
        const manager = new this.$Manager('servers')
        await manager.performAction({
          id: this.params.data[0].id,
          action: 'attach-network',
          data: {
            nets,
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
