import { PREALLOCATION_OPTION_MAP, MEDIUM_MAP } from '@Compute/constants'
import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getBillingTypeTableColumn,
  getTagTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
import { BRAND_MAP } from '@/constants'
import {
  getUnusedTableColumn,
  getStorageTypeTableColumn,
  // getPreallocationTableColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addEncrypt: true,
        formRules: [
          { required: true, message: i18n.t('compute.text_210') },
          { validator: this.$validate('resourceCreateName') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.name')
        },
      }),
      // getStatusTableColumn({ statusModule: 'disk' }),
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'disks',
        columns: () => this.columns,
        editCheck: (row) => (row.provider || '').toLowerCase() !== 'bingocloud',
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.metadata')
        },
      }),
      {
        field: 'disk_size',
        title: i18n.t('table.title.disk_size'),
        sortable: true,
        minWidth: 50,
        slots: {
          default: ({ row }, h) => {
            const preallocation = PREALLOCATION_OPTION_MAP[row.preallocation]?.label
            const isVMware = row.brand === BRAND_MAP.VMware.key

            return [
              <div class={'d-flex'}>
                <span>{ sizestr(row.disk_size, 'M', 1024) }</span>
                { isVMware && preallocation ? <span class={'text-color-help'}>({ preallocation })</span> : null }
              </div>,
            ]
          },
        },
        formatter: ({ row }) => {
          const preallocation = PREALLOCATION_OPTION_MAP[row.preallocation]?.label
          const isVMware = row.brand === BRAND_MAP.VMware.key

          if (isVMware && preallocation) {
            return `${sizestr(row.disk_size, 'M', 1024)}(${preallocation})`
          }
          return sizestr(row.disk_size, 'M', 1024)
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.disk_size')
        },
      },
      // getPreallocationTableColumn(),
      {
        field: 'iops',
        title: i18n.t('compute.max_iops'),
        formatter: ({ row }) => {
          return row.iops || '-'
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.iops')
        },
      },
      {
        field: 'disk_format',
        title: i18n.t('table.title.disk_format'),
        width: 70,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.disk_format')
        },
      },
      getStorageTypeTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.storage_type')
        },
      }),
      {
        field: 'disk_type',
        title: i18n.t('table.title.disk_type'),
        width: 70,
        formatter: ({ row }) => {
          return row.disk_type === 'sys' ? i18n.t('compute.text_49') : i18n.t('compute.text_50')
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.disk_type')
        },
      },
      getUnusedTableColumn({
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.guest_count')
        },
      }),
      {
        field: 'guest',
        title: this.$t('res.server'),
        minWidth: 100,
        showOverflow: 'ellipsis',
        sortable: true,
        sortBy: 'order_by_server',
        slots: {
          default: ({ row }, h) => {
            if (this.isPreLoad && !row.guest) return [<data-loading />]
            if (!row.guest || row.guests.length <= 0) return '-'
            const guests = row.guests.map((guest, index) => {
              return <side-page-trigger permission="server_get" name="VmInstanceSidePage" id={guest.id} vm={this} tab="vm-instance-detail">
                {guest.name}
                <status status={ guest.status } statusModule='server'/>
              </side-page-trigger>
            })
            return [
              <div>
                { guests }
              </div>,
            ]
          },
        },
        formatter: ({ row }) => {
          if (!row.guest || row.guests.length <= 0) return '-'
          const guests = row.guests.map((guest, index) => guest.name)
          return guests.length ? guests.join(',') : '-'
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.guest')
        },
      },
      {
        field: 'device',
        title: this.$t('compute.disk_device'),
        formatter: ({ row }) => {
          return row.device || '-'
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.device')
        },
      },
      getCopyWithContentTableColumn({
        field: 'storage',
        title: i18n.t('table.title.disk_storage'),
        hideField: true,
        slotCallback: (row) => {
          if (this.isPreLoad && !row.storage) return [<data-loading />]
          return row.storage
        },
        formatter: ({ row }) => row.storage,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.storage')
        },
      }),
      getTimeTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.created_at')
        },
      }),
      getBrandTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.brand')
        },
      }),
      getRegionTableColumn({
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.region')
        },
      }),
      getBillingTypeTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.billing_type')
        },
      }),
      getStatusTableColumn({
        statusModule: 'disk',
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.status')
        },
      }),
      getProjectTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.tenant')
        },
      }),
      getAccountTableColumn({
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.account')
        },
      }),
      {
        field: 'medium_type',
        title: i18n.t('table.title.disk_medium_type'),
        width: 70,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.medium_type) return [<data-loading />]
            return MEDIUM_MAP[row.medium_type]
          },
        },
        formatter: ({ row }) => row.medium_type ? MEDIUM_MAP[row.medium_type] : '-',
        hidden: () => {
          if (this.hiddenColumns.includes('medium_type')) return true
          return this.$isScopedPolicyMenuHidden('disk_hidden_columns.storage')
        },
      },
      {
        field: 'auto_reset',
        title: this.$t('compute.shutdown_auto_reset'),
        formatter: ({ row }) => {
          return row.auto_reset ? this.$t('common.true') : this.$t('common.false')
        },
      },
    ]
  },
}
