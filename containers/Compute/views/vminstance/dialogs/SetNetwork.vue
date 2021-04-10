<template>
  <base-dialog @cancel="cancelDialog">
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
          :vpcObj="vpcObj" />
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
import expectStatus from '@/constants/expectStatus'
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
      },
      vpcObj: {
        id: this.params.data[0].vpc_id,
        name: this.params.data[0].vpc,
      },
    }
  },
  computed: {
    networkParams () {
      const { data } = this.params
      const resItem = data && data.length > 0 ? data[0] : {}
      return {
        filter: 'server_type.notin(ipmi, pxe)',
        usable: true,
        cloudregion: resItem.cloudregion_id,
        zone: resItem.zone_id,
        host: resItem.host,
      }
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
        for (const key in networks) {
          const o = {
            network: networks[key],
          }
          if (networkIps && networkIps[key]) {
            o.address = networkIps[key]
          }
          nets.push(o)
        }
        const manager = new this.$Manager('servers')
        await manager.performAction({
          id: this.params.data[0].id,
          action: 'attachnetwork',
          data: {
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
