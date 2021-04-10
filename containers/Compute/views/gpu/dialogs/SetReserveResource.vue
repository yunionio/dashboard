<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.gpu')" :count="params.data.length" :action="title" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc"
        hideRequiredMark>
        <reserve-resource :decorators="decorators" />
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import {
  getReserveResourceColumn,
} from '../utils/columns'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import ReserveResource from '@Compute/sections/ReserveResource'

export default {
  name: 'SetReserveResourceDialog',
  components: {
    ReserveResource,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const DEVICE_MAP = {
      '10de': 'nvidia',
      1002: 'amd',
    }
    const initValue = this.params.data[0]
    return {
      title: this.$t('compute.text_490'),
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
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row, 'gpu-detail') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'model',
          title: this.$t('compute.text_482'),
          minWidth: 120,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              const device = row.vendor_device_id.split(':')[0]
              if (!device) {
                return row.model
              }
              return [
                <div class='d-flex'>
                  <span class='text-truncate'>{ row.model }</span>
                  <icon class="ml-1" style="line-height: 24px" type={ DEVICE_MAP[device] } />
                </div>,
              ]
            },
          },
        },
        getCopyWithContentTableColumn({
          field: 'host',
          title: this.$t('compute.text_484'),
          hideField: true,
          slotCallback: row => row.host || row.host_id,
        }),
        getReserveResourceColumn(),
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
      const ids = this.params.data.map((item) => item.id)
      return new this.$Manager('isolated_devices').batchUpdate({
        ids,
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
      this.sidePageTriggerHandle(this, 'GpuSidePage', {
        id: row.id,
        resource: 'isolated_devices',
        currentTab: 'servers-list',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
