<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1162')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1162')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item
          :label="$t('compute.text_1163')"
          :validate-status="hostValidateStatus"
          :help="hostValidateMsg">
          <base-select
            class="w-100"
            v-decorator="decorators.prefer_host_id"
            :options="hostsOptions"
            :params="selectParams"
            :disabled-items="disabledItems"
            :select-props="{ placeholder: $t('compute.text_314') }" />
        </a-form-item>
        <!-- 自动启动 -->
        <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_495')">
          <a-switch
            :checkedChildren="$t('compute.text_115')"
            :unCheckedChildren="$t('compute.text_116')"
            v-decorator="decorators.auto_start" />
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
import { typeClouds } from '@/utils/common/hypervisor'

const hypervisorMap = typeClouds.hypervisorMap

export default {
  name: 'VmAddBackupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      forcastData: null,
      hosts: [],
      decorators: {
        prefer_host_id: [
          'prefer_host_id',
          {
            rules: [
              { required: false, message: this.$t('compute.text_1165'), trigger: 'blur' },
            ],
          },
        ],
        auto_start: [
          'auto_start',
          {
            initialValue: false,
            valuePropName: 'checked',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'scope']),
    firstData () {
      return this.params.data[0]
    },
    selectParams () {
      const params = {
        enabled: 1,
        host_type: this.firstData.hypervisor,
        host_status: 'online',
        server_id_for_network: this.firstData.id,
        os_arch: this.firstData.os_arch,
      }
      if (this.firstData.hypervisor === hypervisorMap.kvm.key) {
        params.host_type = 'hypervisor'
      }
      if (this.isAdminMode && this.params.data.length === 1) {
        params.project_domain = this.firstData.domain_id
      }
      if (this.isDomainMode) {
        params.scope = this.scope
      }
      return params
    },
    disabledItems () {
      return [this.firstData.host_id]
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
      return this.$t('compute.text_1164')
    },
    handleConfirmDisabled () {
      return this.forcastData && this.hostsOptions?.length === 0
    },
  },
  created () {
    this.queryForcastData()
    this.queryHosts()
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'create-backup',
            data: values,
          },
        })
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
    queryHosts () {
      const hostsManager = new this.$Manager('hosts')
      hostsManager.list({ params: this.selectParams }).then((res) => {
        this.hosts = res.data.data || []
      }).catch((err) => {
        console.log(err)
        throw err
      })
    },
  },
}
</script>
