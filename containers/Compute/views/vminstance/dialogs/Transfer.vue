<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1127')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1127')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <!-- 自动启动 -->
        <a-form-item :label="$t('compute.text_494')" v-if="isSingle && isAllReady" :extra="$t('compute.text_1263')">
          <a-switch
            :checkedChildren="$t('compute.text_115')"
            :unCheckedChildren="$t('compute.text_116')"
            v-decorator="decorators.auto_start" />
        </a-form-item>
        <!-- 跳过CPU检查 -->
        <a-form-item :label="$t('compute.live_migrate.skip_cpu_check')" v-if="isKvm && isAllRunning" :extra="$t('compute.live_migrate.skip_cpu_check.explain')">
          <a-switch
            :checkedChildren="$t('compute.text_115')"
            :unCheckedChildren="$t('compute.text_116')"
            v-decorator="decorators.skip_cpu_check"
            @change="onSkipCpuCheck" />
        </a-form-item>
        <a-form-item
          :label="$t('compute.text_111')">
          <list-select
            v-decorator="decorators.host"
            :list-props="resourceProps"
            :formatter="v => v.name"
            :multiple="false"
            :placeholder="$t('compute.text_314')"
            :dialog-params="{ title: $t('compute.text_111'), width: 1060 }"
            :tab-props="tabProps"
            @change="hostChangeHandle" />
            <div :class="[hostValidateStatus]" style="line-height: 20px; color: rgba(0,0,0,.45);">{{ message || hostValidateMsg }}</div>
        </a-form-item>
        <template v-if="isKvm && isAllRunning">
          <a-form-item>
            <span slot="label">
              {{ $t('compute.vminstance.transfer.max_brand_width') }}
              <a-tooltip :title="$t('compute.transfer.max_brand_width.tooltip')"><a-icon type="question-circle-o" /></a-tooltip>
            </span>
            <migration-bandwidth :decorators="decorators" :form="form" />
          </a-form-item>
        </template>
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
import { HYPERVISORS_MAP } from '@/constants'
import ListSelect from '@/sections/ListSelect'
import MigrationBandwidth from '@Compute/sections/MigrationBandwidth'
import ResourceProps from '../mixins/resourceProps'

export default {
  name: 'VmTransferDialog',
  components: {
    ListSelect,
    MigrationBandwidth,
  },
  mixins: [DialogMixin, WindowsMixin, ResourceProps],
  data () {
    const isVMware = this.params.data[0].hypervisor === HYPERVISORS_MAP.esxi.key

    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {},
      },
      forcastData: null,
      hosts: [],
      message: '',
      decorators: {
        host: [
          'host',
          {
            rules: [
              { required: isVMware, message: this.$t('compute.text_314'), trigger: 'change' },
            ],
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
        brandWidth: [
          'brandWidth',
          {
            initialValue: '-1',
          },
        ],
        customBrandWidth: [
          'customBrandWidth',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.vminstance.transfer.max_brand_width.required'), trigger: 'change' },
              { pattern: /^[1-9][0-9]*$/, message: this.$t('compute.transfer.bandwidth.number.check') },
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
    isKvm () {
      return this.firstData.hypervisor === HYPERVISORS_MAP.kvm.key
    },
    isVMware () {
      return this.firstData.hypervisor === HYPERVISORS_MAP.esxi.key
    },
    filteredCandidates () {
      if (!this.forcastData) {
        return []
      }
      const candsMap = {}
      this.forcastData.data.map(results => {
        if (results.data.filtered_candidates) {
          results.data.filtered_candidates.map(candidate => {
            if (candsMap[candidate.id]) {
              candsMap[candidate.id].count++
              candidate.reasons.map(reason => {
                if (!candsMap[candidate.id].reasons.includes(reason)) {
                  candsMap[candidate.id].reasons.push(reason)
                }
              })
            } else {
              candidate.count = 1
              candsMap[candidate.id] = candidate
            }
          })
        }
      })
      const ret = []
      for (var id in candsMap) {
        if (candsMap[id].count >= this.params.data.length) {
          ret.push(candsMap[id])
        }
      }
      return ret
    },
    canCreate () {
      if (!this.forcastData) {
        return true
      }
      let canCreate = false
      this.forcastData.data.map(results => {
        if (results.data.can_create) {
          canCreate = true
        }
      })
      return canCreate
    },
    hostsParams () {
      let hostType = 'hypervisor'
      const hostIds = this.filteredCandidates?.map(v => v.id) || []
      const managerIds = []
      this.params.data.map(item => {
        if (item.manager_id && !managerIds.includes(item.manager_id)) {
          managerIds.push(item.manager_id)
        }
      })

      if (!this.isKvm) {
        hostType = this.firstData.hypervisor
      }
      const ret = {
        scope: this.scope,
        host_type: hostType,
        limit: 10,
        enabled: 1,
        host_status: 'online',
        os_arch: this.firstData.os_arch,
      }
      if (this.isSingle) {
        ret.server_id_for_network = this.firstData.id
        if (!hostIds.includes(this.firstData.host_id)) {
          hostIds.push(this.firstData.host_id)
        }
      }
      if (this.isAdminMode && this.isSingle) {
        ret.project_domain = this.params.data[0].domain_id
      }
      if (hostIds && hostIds.length > 0) {
        ret.filter = [`id.notin(${hostIds.join(',')})`]
      }
      if (managerIds.length) {
        ret.filter = [...(ret.filter || []), `manager_id.in(${managerIds.join(',')})`]
      }
      return ret
    },
    hostsOptions () {
      const hostIds = this.filteredCandidates?.map(v => v.id) || []
      if (!this.canCreate) {
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
      if (this.message) return 'warning-color'
      if (this.forcastData && this.hostsOptions?.length === 0) {
        return 'error-color'
      }
      return 'info-color'
    },
    hostValidateMsg () {
      if (this.isVMware) return this.$t('compute.vmware.transfer.message')
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
    isAllRunning () {
      return this.params.data.every(item => item.status === 'running')
    },
    isAllReady () {
      return this.params.data.every(item => item.status === 'ready')
    },
    isESXiManager () {
      return this.params.data[0].manager_id
    },
    tabProps () {
      const filtered = this.filteredCandidates
      const filteredLabel = this.$t('compute.unavailable_host') + '(' + (filtered ? filtered.length : 0) + ')'
      const availableLabel = this.$t('compute.available_host')
      const tabs = [
        { label: availableLabel, value: 'available' },
      ]
      if (filtered && filtered.length > 0) {
        tabs.push({ label: filteredLabel, value: 'unavailable' })
      }
      return {
        curTab: 'available',
        tabs: tabs,
        listProps: {
          data: filtered || [],
          columns: [
            {
              field: 'name',
              title: this.$t('table.title.name'),
              slots: {
                default: ({ row }, h) => {
                  return row.name
                },
              },
            },
            {
              field: 'reasons',
              title: this.$t('common.reason'),
              slots: {
                default: ({ row }, h) => {
                  const ret = row.reasons.map(item => {
                    return <li>{item}</li>
                  })
                  return [<ul style={{ marginLeft: '-26px' }}>{ ...ret }</ul>]
                },
              },
            },
          ],
        },
      }
    },
  },
  created () {
    !this.isESXiManager && this.queryForcastData()
    this.queryHosts()
  },
  methods: {
    doSingleTransfer (ids, values) {
      let action = 'migrate'
      const selectedItem = this.params.data[0]
      const data = {
        prefer_host: values.host,
      }
      if (this.isAllReady) {
        data.auto_start = values.auto_start
      }
      if (!this.isAllRunning) {
        action = 'migrate'
      } else {
        action = 'live-migrate'
        if (values.skip_cpu_check) {
          data.skip_cpu_check = true
          data.skip_kernel_check = true
        }
        if (values.brandWidth !== '-1') {
          data.max_bandwidth_mb = values.brandWidth === 'custom' ? (+values.customBrandWidth || 0) : +values.brandWidth
        }
        data.quickly_finish = true
      }
      if (selectedItem.host_enabled === false && selectedItem.host_status === 'offline') {
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
      if (values.brandWidth !== '-1') {
        data.max_bandwidth_mb = values.brandWidth === 'custom' ? (+values.customBrandWidth || 0) : +values.brandWidth
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
      if (live_migrate && skip_cpu_check) {
        params.skip_kernel_check = true
      }
      const ids = []
      this.params.data.map(item => {
        ids.push(item.id)
      })
      return manager.batchPerformAction({
        ids: ids, // this.params.data[0].id,
        action: 'migrate-forecast',
        data: params,
      })
    },
    queryForcastData (skip_cpu_check, prefer_host_id) {
      const live_migrate = this.firstData.status === 'running'
      this.doForecast(live_migrate, skip_cpu_check, prefer_host_id).then((res) => {
        this.forcastData = res.data
      }).catch((err) => {
        throw err
      })
    },
    queryHosts () {
      const hostsManager = new this.$Manager('hosts')
      hostsManager.list({ params: this.hostsParams }).then((res) => {
        this.hosts = res.data.data || []
      }).catch((err) => {
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
    onSkipCpuCheck (e) {
      !this.isESXiManager && this.queryForcastData(e)
    },
  },
}
</script>
