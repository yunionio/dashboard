<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>{{$t('compute.text_560')}}</template>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.host')" :count="params.data.length" :action="title" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" layout="inline" hideRequiredMark>
        <reserve-resource :decorators="decorators" :label="$t('compute.each_reserved_passthrough')" />
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
import { sizestr } from '@/utils/utils'
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
    const getRsVal = (val) => {
      return Math.ceil(val / this.params.data[0].isolated_device_count)
    }
    return {
      title: this.$t('compute.setup_passthrough_reserve'),
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        cpu: [
          'cpu',
          {
            initialValue: getRsVal(initValue.reserved_cpu),
            rules: [
              { required: true, message: ' ' },
            ],
          },
        ],
        memory: [
          'memory',
          {
            initialValue: getRsVal(initValue.reserved_memory / 1024),
            rules: [
              { required: true, message: ' ' },
            ],
          },
        ],
        disk: [
          'disk',
          {
            initialValue: getRsVal(initValue.reserved_storage / 1024),
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
          field: '',
          title: this.$t('compute.text_501'),
          minWidth: 100,
          showOverflow: 'title',
          slots: {
            default: ({ row }, h) => {
              const rs = row.reserved_resource_for_gpu || {}
              const ret = []
              if (rs.reserved_cpu) {
                const config = rs.reserved_cpu + 'C' + (rs.reserved_memory ? sizestr(rs.reserved_memory, 'M', 1024) : '') + (rs.reserved_storage ? sizestr(rs.reserved_storage, 'M', 1024) : '')
                return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
              }
              return ret
            },
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
      const ids = this.params.data.map((item) => { return item.id })
      return new this.$Manager('hosts').batchPerformAction({
        ids,
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
