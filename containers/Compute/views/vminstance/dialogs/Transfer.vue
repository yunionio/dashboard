<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1127')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" v-if="message">
        <div slot="message">{{ message }}</div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1127')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <!-- 强制迁移 -->
        <a-form-item :label="$t('compute.text_1261')" v-if="isSingle" :extra="$t('compute.text_1262')">
          <a-switch
            :checkedChildren="$t('compute.text_115')"
            :unCheckedChildren="$t('compute.text_116')"
            v-decorator="decorators.rescue_mode"
            @change="rescueModeChangeHandle" />
        </a-form-item>
        <!-- 自动启动 -->
        <a-form-item :label="$t('compute.text_494')" v-if="isSingle && firstData.status === 'ready'" :extra="$t('compute.text_1263')">
          <a-switch
            :checkedChildren="$t('compute.text_115')"
            :unCheckedChildren="$t('compute.text_116')"
            v-decorator="decorators.auto_start" />
        </a-form-item>
        <!-- 跳过CPU检查 -->
        <a-form-item :label="$t('compute.live_migrate.skip_cpu_check')" v-if="firstData.status === 'running'" :extra="$t('compute.live_migrate.skip_cpu_check.explain')">
          <a-switch
            :checkedChildren="$t('compute.text_115')"
            :unCheckedChildren="$t('compute.text_116')"
            v-decorator="decorators.skip_cpu_check"
            @change="skipCpuCheckChangeHandle" />
        </a-form-item>
        <a-form-item
          :label="$t('compute.text_111')"
          :validate-status="hostValidateStatus"
          :help="hostValidateMsg">
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ListSelect from '@/sections/ListSelect'
import ResourceProps from '../mixins/resourceProps'

export default {
  name: 'VmTransferDialog',
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
      forcastData: null,
      hosts: [],
      message: '',
      decorators: {
        host: [
          'host',
          {
            rules: [
              { required: false, message: this.$t('compute.text_314'), trigger: 'change' },
            ],
          },
        ],
        rescue_mode: [
          'rescue_mode',
          {
            initialValue: false,
            valuePropName: 'checked',
          },
        ],
        auto_start: [
          'auto_start',
          {
            initialValue: true,
            valuePropName: 'checked',
          },
        ],
        skip_cpu_check: [
          'skip_cpu_check',
          {
            initialValue: false,
            valuePropName: 'checked',
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
      let hostType = 'hypervisor'
      if (this.firstData.hypervisor !== 'kvm') {
        hostType = this.firstData.hypervisor
      }
      const ret = {
        scope: this.scope,
        host_type: hostType,
        limit: 20,
        enabled: 1,
        host_status: 'online',
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
    this.isSingle && this.queryForcastData()
    this.queryHosts()
  },
  methods: {
    doSingleTransfer (ids, values) {
      let action = 'migrate'
      const data = {
        prefer_host: values.host,
      }
      if (this.firstData.status === 'ready') {
        data.auto_start = values.auto_start
      }
      if (this.firstData.status !== 'running') {
        action = 'migrate'
      } else {
        action = 'live-migrate'
        if (values.skip_cpu_check) {
          data.skip_cpu_check = true
          data.skip_kernel_check = true
        }
      }
      if (values.rescue_mode) {
        action = 'migrate'
        data.rescue_mode = true
      }
      return this.params.onManager('performAction', {
        id: this.firstData.id,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action,
          data,
        },
      })
    },
    doBatchTransfer (ids, values) {
      const data = {
        guest_ids: ids,
        prefer_host: values.host,
      }
      if (values.skip_cpu_check) {
        data.skip_cpu_check = true
        data.skip_kernel_check = true
      }
      return this.params.onManager('performClassAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'batch-migrate',
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
    doForecast (live_migrate = true, skip_cpu_check = false, prefer_host_id) {
      const manager = new this.$Manager('servers')
      const params = {
        live_migrate,
        skip_cpu_check,
      }
      if (prefer_host_id) {
        params.prefer_host_id = prefer_host_id
      }
      return manager.performAction({
        id: this.params.data[0].id,
        action: 'migrate-forecast',
        data: params,
      })
    },
    queryForcastData (skip_cpu_check, prefer_host_id) {
      const live_migrate = this.firstData.status === 'running'
      this.doForecast(live_migrate, skip_cpu_check, prefer_host_id).then((res) => {
        this.forcastData = res.data
      }).catch((err) => {
        console.log(err)
        throw err
      })
    },
    rescueModeChangeHandle (v) {
      this.form.fc.setFieldsValue({ host: '' })
      if (v) {
        this.forcastData = null
      } else {
        this.queryForcastData(false)
      }
    },
    skipCpuCheckChangeHandle (v) {
      const rescue_mode = this.form.fc.getFieldValue('rescue_mode')
      if (rescue_mode) return
      if (!this.isSingle) return
      this.queryForcastData(v)
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
