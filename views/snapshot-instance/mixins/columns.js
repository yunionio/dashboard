import { sizestr } from '@/utils/utils'
import {
  getBrandTableColumn,
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'instance_snapshot', columns: () => this.columns }),
      {
        field: 'rules',
        title: i18n.t('table.title.sub_snapshot'),
        minWidth: 220,
        type: 'expand',
        slots: {
          default: ({ row }) => {
            const len = (row.snapshots && row.snapshots.length) || 0
            return i18n.t('compute.text_619', [len])
          },
          content: ({ row }) => {
            const list = row.snapshots.map(val => (
              <a-tag class='mb-2'>{ val.name }</a-tag>
            ))
            return list
          },
        },
      },
      {
        field: 'size',
        title: i18n.t('table.title.snapshot_size'),
        width: 70,
        formatter: ({ row }) => {
          const size = row.snapshots && row.snapshots.reduce((a, b) => a + b.size, 0)
          return sizestr(size, 'M', 1024)
        },
      },
      getStatusTableColumn({ statusModule: 'snapshot' }),
      getProjectTableColumn(),
      {
        field: 'guest',
        title: i18n.t('res.server'),
        minWidth: 70,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }, h) => {
            return [
              <div class='text-truncate'>
                {row.guest ? <list-body-cell-wrap copy field='guest' row={row} /> : '-'}
                {row.guest_status ? <status status={ row.guest_status } statusModule='server'/> : ''}
              </div>,
            ]
          },
        },
      },
      getBrandTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
