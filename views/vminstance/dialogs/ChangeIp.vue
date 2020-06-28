<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更换IP</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>
          <div>更换IP后，重启网络或重启机器后生效</div>
        </template>
      </a-alert>
      <dialog-selected-tips :count="params.data.length" action="更换IP" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="IP子网" v-bind="formItemLayout" class="mb-0">
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
                  :select-props="{ placeholder: '请选择IP子网' }"
                  :mapper="mapper" />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item>
                <a-input
                  class="w-100"
                  v-decorator="decorators.ip"
                  placeholder="请输入子网内的IP地址，非必填" />
              </a-form-item>
            </a-col>
          </a-row>
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
import { isWithinRange } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'VmChangeIpDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const validateIp = (rule, value, callback) => {
      let msg
      if (!R.isNil(value) && !R.isEmpty(value)) {
        if (R.isEmpty(this.form.fi.network)) {
          msg = '请选择子网'
          return callback(msg)
        }
        if (!isWithinRange(value, this.form.fi.network.guest_ip_start, this.form.fi.network.guest_ip_end)) {
          msg = '输入的IP不在子网内'
          return callback(msg)
        }
      }
      return callback()
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fi: {
          network: {},
        },
      },
      decorators: {
        network: [
          'network',
          {
            rules: [
              { required: true, message: '请选择子网' },
            ],
          },
        ],
        ip: [
          'ip',
          {
            rules: [
              { validator: validateIp },
            ],
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
    }
  },
  computed: {
    ...mapGetters(['scope']),
    networkParams () {
      const params = {
        zone: this.params.zone,
        scope: this.scope,
        wire: this.params.data[0].wire_id,
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
        return 'VMware平台暂不支持更改IP功能，此处修改仅仅修改界面展示IP，请根据实际情况操作'
      }
      return ''
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      let manager = new this.$Manager('servers')
      try {
        const values = await this.form.fc.validateFields()
        const data = {
          ip_addr: this.params.data[0].ip_addr,
          net_desc: values.ip ? `${values.network}:${values.ip}` : values.network,
        }
        await manager.performAction({
          id: this.params.resId,
          action: 'change-ipaddr',
          data,
        })
        this.params.refresh()
        this.$bus.$emit('VMInstanceListSingleUpdate', [this.params.resId])
        this.cancelDialog()
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
