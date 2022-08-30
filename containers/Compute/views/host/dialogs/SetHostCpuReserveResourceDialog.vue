<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>{{ $t('compute.host.cpu.revert.resource.message') }}</template>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.host')" :count="params.data.length" :action="title" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_1058')">
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
      title: this.$t('compute.host.cpu.revert.resource'),
      loading: false,
      form: {
        fc: this.$form.createForm(this),
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
        cpus: [
          'cpus',
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
    selectedItems () {
      return this.params.data
    },
    selectedItem () {
      return this.selectedItems[0]
    },
    isSingle () {
      return this.selectedItems?.length === 1
    },
    hostCpus () {
      const cpuCounts = this.selectedItems.map(item => item.cpu_count)
      return Math.max(...cpuCounts)
    },
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      const cpuArr = this.selectedItems.map(item => {
        const reserved_cpus_info = JSON.parse(item.metadata.reserved_cpus_info || '{}')
        const cpus = (reserved_cpus_info?.cpus || '').split(',').map(v => parseInt(v))
        return cpus
      })
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          cpus: _.intersection(...cpuArr),
        })
      })
    },
    doReserveResourceSubmit (values) {
      const { cpus } = values
      const ids = this.params.data.map(item => item.id)
      const params = { cpus: cpus.join(',') }

      if (this.isSingle) {
        return this.params.onManager('performAction', {
          id: ids[0],
          steadyStatus: ['ready'],
          managerArgs: {
            action: 'reserve-cpus',
            data: params,
          },
        })
      } else {
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
