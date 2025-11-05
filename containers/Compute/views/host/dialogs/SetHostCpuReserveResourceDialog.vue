<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>{{ $t('compute.host.cpu.revert.resource.message') }}</template>
      </a-alert>
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>{{ $t('compute.host.cpu.revert.resource.message_1') }}</template>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.host')" :count="params.data.length" :action="title" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.executable_file_name')" :extra="$t('compute.executable_file_name.extra')">
          <a-textarea v-decorator="decorators.processes_prefix" :rows="5" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_1058')" :extra="cpuExtra">
          <a-checkbox-group
            v-decorator="decorators.cpus"
            style="width: 100%; margin-top: 10px;">
            <a-row>
              <a-col :span="4" v-for="v in hostCpus" :key="v">
                <a-checkbox :value="v - 1">{{ v - 1 }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="Numa Node">
          <a-checkbox-group
            v-decorator="decorators.nodes"
            style="width: 100%; margin-top: 10px;">
            <a-row>
              <a-col :span="4" v-for="v in hostNodes" :key="v">
                <a-checkbox :value="v - 1">{{ v - 1 }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
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
import _ from 'lodash'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'SetHostCpuReserveResourceDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      title: this.$t('compute.host.set_system_reserve_resource'),
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          cpus: [],
          processes_prefix: '',
          nodes: [],
        },
      },
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.params.onManager,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row, 'host-detail') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'custom_ip',
          title: 'IP',
          width: 200,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              const cellWrap = []
              if (row.access_ip) {
                cellWrap.push(
                  <div class="d-flex">
                    <list-body-cell-wrap row={row} field="access_ip" copy><span class="text-color-help">{this.$t('compute.text_1319')}</span></list-body-cell-wrap>
                  </div>,
                )
              }
              if (row.ipmi_ip) {
                cellWrap.push(
                  <div class="d-flex">
                    <list-body-cell-wrap row={row} field="ipmi_ip" copy><span class="text-color-help">{this.$t('compute.text_1320')}</span></list-body-cell-wrap>
                  </div>,
                )
              }
              return cellWrap
            },
          },
        },
        {
          field: 'nonsystem_guests',
          sortBy: 'order_by_server_count',
          title: '#VM',
          width: 60,
          sortable: true,
          slots: {
            default: ({ row }, h) => {
              if (this.isPreLoad && row.nonsystem_guests === undefined) return [<data-loading />]
              return `${row.nonsystem_guests}`
            },
          },
        },
      ],
      decorators: {
        processes_prefix: [
          'processes_prefix',
        ],
        cpus: [
          'cpus',
        ],
        nodes: [
          'nodes',
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
      selectedItems: [],
    }
  },
  computed: {
    cpuExtra () {
      return this.form.fd.cpus.length === 0 ? this.$t('compute.host.cpu_reserve_extra') : null
    },
    selectedItem () {
      return this.selectedItems && this.selectedItems[0]
    },
    isSingle () {
      return this.selectedItems?.length === 1
    },
    hostCpus () {
      const cpuCounts = this.selectedItems.map(item => item.cpu_count)
      return Math.max(...cpuCounts)
    },
    hostNodes () {
      const cpuCounts = this.selectedItems.map(item => (item.sys_info?.topology?.nodes || []).length)
      return Math.max(...cpuCounts)
    },
  },
  created () {
    this.init()
  },
  methods: {
    // split(/\r*\n/)
    async init () {
      try {
        const res = await new this.$Manager('hosts').list({
          params: {
            filter: `id.in(${this.params.data.map(item => item.id).join(',')})`,
          },
        })
        this.selectedItems = res.data.data || []
      } catch (error) {
        throw error
      }
      if (this.selectedItems.length === 0) {
        this.selectedItems = this.params.data
      }
      const arr = this.selectedItems.map(item => {
        const reserved_cpus_info = JSON.parse(item.metadata.reserved_cpus_info || '{}')
        const cpus = item.metadata.reserved_cpus_info ? (reserved_cpus_info?.cpus || '').split(',').map(v => parseInt(v)) : []
        const processes_prefix = item.metadata.reserved_cpus_info ? reserved_cpus_info?.processes_prefix || [] : []
        const mems = item.metadata.reserved_cpus_info ? (reserved_cpus_info?.mems || '').split(',').map(v => parseInt(v)) : []
        return { cpus, mems, processes_prefix }
      })
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          cpus: _.intersection(...(arr.map(item => item.cpus))),
          processes_prefix: _.intersection(...(arr.map(item => item.processes_prefix))).join('\n'),
          nodes: _.intersection(...(arr.map(item => item.mems))),
        })
      })
    },
    doReserveResourceSubmit (values) {
      const { cpus, nodes, processes_prefix = [] } = values
      const ids = this.params.data.map(item => item.id)
      const params = { cpus: cpus.join(','), mems: nodes.join(','), processes_prefix }

      if (this.isSingle) {
        if (cpus.length === 0) {
          return this.params.onManager('performAction', {
            id: ids[0],
            steadyStatus: ['ready'],
            managerArgs: {
              action: 'unreserve-cpus',
            },
          })
        }
        return this.params.onManager('performAction', {
          id: ids[0],
          steadyStatus: ['ready'],
          managerArgs: {
            action: 'reserve-cpus',
            data: params,
          },
        })
      } else {
        if (cpus.length === 0) {
          return this.params.onManager('batchPerformAction', {
            id: ids,
            steadyStatus: ['ready'],
            managerArgs: {
              action: 'unreserve-cpus',
            },
          })
        }
        return this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['ready'],
          managerArgs: {
            action: 'reserve-cpus',
            data: params,
          },
        })
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        values.processes_prefix = (values.processes_prefix || '').split(/\r*\n/).filter(v => v.trim() !== '')
        await this.doReserveResourceSubmit(values)
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
        this.$message.success(this.$t('compute.text_423'))
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
