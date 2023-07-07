import { sizestr } from '@/utils/utils'
import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getCopyWithContentTableColumn,
  getTagTableColumn,
  getRegionTableColumn,
  getAccountTableColumn,
  getOsArch,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import { getStorageTypeTableColumn } from '../utils/columns'
import { DISK_TYPES } from '../constants'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addEncrypt: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.name')
        },
      }),
      getStatusTableColumn({
        statusModule: 'snapshot',
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.status')
        },
      }),
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'snapshots',
        columns: () => this.columns,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.metadata')
        },
      }),
      getOsArch({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.os_arch')
        },
      }),
      {
        field: 'size',
        title: i18n.t('table.title.snapshot_size'),
        width: 70,
        formatter: ({ row }) => {
          return sizestr(row.size, 'M', 1024)
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.size')
        },
      },
      {
        field: 'disk_type',
        title: i18n.t('table.title.disk_type'),
        width: 70,
        formatter: ({ row }) => {
          return DISK_TYPES[row.disk_type] || row.disk_type
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.disk_type')
        },
      },
      getCopyWithContentTableColumn({
        field: 'disk_name',
        title: i18n.t('res.disk'),
        hideField: true,
        slotCallback: (row) => {
          if (this.isPreLoad && !row.disk_name) return [<data-loading />]
          return row.disk_name
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.disk_name')
        },
      }),
      getStorageTypeTableColumn({
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.storage_type')
        },
      }),
      {
        field: 'guest',
        title: i18n.t('res.server'),
        minWidth: 70,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }, h) => {
            if (this.isPreLoad && !row.guest) return [<data-loading />]
            return [
              <div class='text-truncate'>
                {row.guest ? <list-body-cell-wrap copy field='guest' row={row} /> : '-'}
                {row.guest_status ? <status status={ row.guest_status } statusModule='server'/> : ''}
              </div>,
            ]
          },
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.guest')
        },
      },
      getBrandTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.brand')
        },
      }),
      getAccountTableColumn({
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.account')
        },
      }),
      getTimeTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.created_at')
        },
      }),
      getProjectTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.tenant')
        },
      }),
      getRegionTableColumn({
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.region')
        },
      }),
    ]
  },
}
