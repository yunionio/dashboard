<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1127')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1127')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.v2vtransfer.type')">
          <a-radio v-decorator="decorators.type">{{ $t('compute.v2vtransfer.kvm') }} <help-tooltip name="v2vTransferType" /></a-radio>
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
      <a-button type="primary" @click="handleConfirm" :loading="loading" :disabled="handleConfirmDisabled">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { typeClouds } from '@/utils/common/hypervisor'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ListSelect from '@/sections/ListSelect'
import ResourceProps from '../mixins/resourceProps'

export default {
  name: 'VmV2vTransferDialog',
  components: {
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin, ResourceProps],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
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
        host: [
          'host',
          {
            rules: [
              { required: false, message: this.$t('compute.text_314'), trigger: 'change' },
            ],
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
      const ret = {
        scope: this.scope,
        limit: 20,
        enabled: 1,
        host_status: 'online',
        brand: typeClouds.brandMap.OneCloud.brand,
        server_id_for_network: this.firstData.id,
        os_arch: this.firstData.os_arch,
      }
      if (this.isAdminMode && this.isSingle) {
        ret.project_domain = this.params.data[0].domain_id
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
      return this.$t('compute.text_1384')
    },
    handleConfirmDisabled () {
      return this.forcastData && this.hostsOptions?.length === 0
    },
    columns () {
      const fields = ['name', 'status', 'host']
      return this.params.columns.filter(item => {
        const { field } = item
        return fields.indexOf(field) > -1
      })
    },
  },
  created () {
    // this.isSingle && this.queryForcastData()
    this.queryHosts()
  },
  methods: {
    queryForcastData () {
      this.doForecast().then((res) => {
        this.forcastData = res.data
      }).catch((err) => {
        console.log(err)
        throw err
      })
    },
    doForecast () {
      const manager = new this.$Manager('servers')

      return manager.performAction({
        id: this.firstData.id,
        action: 'migrate-forecast',
        data: {},
      })
    },
    doSingleTransfer (ids, values) {
      const data = {
        prefer_host: values.host,
      }
      return this.params.onManager('performAction', {
        id: this.firstData.id,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'convert-to-kvm',
          data,
        },
      })
    },
    doBatchTransfer (ids, values) {
      const data = {
        guest_ids: ids,
        prefer_host: values.host,
      }
      return this.params.onManager('performClassAction', {
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
        if (this.isSingle) {
          await this.doSingleTransfer(ids, values)
        } else {
          await this.doBatchTransfer(ids, values)
        }
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
  },
}
</script>
