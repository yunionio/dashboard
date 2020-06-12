<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.host')" :count="params.data.length" :action="title" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc"
        hideRequiredMark>
        <reserve-resource :decorators="decorators" :data="params.data" label="单个GPU预留资源" />
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { getIsolatedDeviceCountColumns } from '../utils/columns'
import { sizestr, percentstr } from '@/utils/utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import ReserveResource from '@Compute/sections/ReserveResource'

export default {
  name: 'SetHostReserveResourceDialog',
  components: {
    ReserveResource,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initValue = this.params.data[0].reserved_resource_for_gpu
    return {
      title: '设置GPU卡预留资源',
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        cpu: [
          'cpu',
          {
            initialValue: initValue.reserved_cpu,
            rules: [
              { required: true, message: ' ' },
            ],
          },
        ],
        memory: [
          'memory',
          {
            initialValue: initValue.reserved_memory / 1024,
            rules: [
              { required: true, message: ' ' },
            ],
          },
        ],
        disk: [
          'disk',
          {
            initialValue: initValue.reserved_storage / 1024,
            rules: [
              { required: true, message: ' ' },
            ],
          },
        ],
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
        getIsolatedDeviceCountColumns(),
        {
          field: 'cpu_count',
          title: '物理CPU',
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return '' + cellValue + '/' + percentstr(row.cpu_commit_rate)
            } else {
              return 'N/A'
            }
          },
        },
        {
          field: 'mem_size',
          title: '物理内存',
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return sizestr(cellValue, 'M', 1024) + '/' + percentstr(row.mem_commit_rate)
            } else {
              return 'N/A'
            }
          },
        },
        {
          field: 'storage_size',
          title: '物理存储',
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return sizestr(cellValue, 'M', 1024) + '/' + percentstr(row.storage_commit_rate)
            } else {
              return 'N/A'
            }
          },
        },
      ],
    }
  },
  created () {
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    doSubmit (data) {
      return new this.$Manager('hosts').performAction({
        id: this.params.data[0].id,
        action: 'set-reserved-resource-for-isolated-device',
        data: {
          reserved_cpu: data.cpu,
          reserved_memory: data.memory * 1024,
          reserved_storage: data.disk * 1024,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        await this.doSubmit(values)
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    handleOpenSidepage (row, tab) {
      this.initSidePageTab(tab)
      this.sidePageTriggerHandle(this, 'HostSidePage', {
        id: row.id,
        resource: 'hosts',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
