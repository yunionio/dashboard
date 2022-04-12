import { sizestr } from '@/utils/utils'
import {
  getBrandTableColumn,
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getTagTableColumn,
  getOsArch,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

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
      }),
      getStatusTableColumn({ statusModule: 'snapshot' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'instance_snapshots', columns: () => this.columns }),
      {
        field: 'rules',
        title: i18n.t('table.title.sub_snapshot'),
        minWidth: 220,
        type: 'expand',
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.snapshots) return [<data-loading />]
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
        field: 'with_memory',
        title: i18n.t('compute.mem_snapshot'),
        width: 100,
        formatter: ({ row }) => {
          return row.with_memory ? i18n.t('compute.contains') : i18n.t('compute.not_contains')
        },
      },
      getOsArch(),
      {
        field: 'size',
        title: i18n.t('table.title.snapshot_size'),
        width: 70,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.size) return [<data-loading />]
            return sizestr(row.size, 'M', 1024)
          },
        },
      },
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
      },
      getBrandTableColumn(),
      getTimeTableColumn(),
      getProjectTableColumn(),
    ]
  },
}
