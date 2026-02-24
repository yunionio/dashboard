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
      getStatusTableColumn({ statusModule: 'snapshot', vm: this }),
      getTagTableColumn({ onManager: this.onManager, resource: 'instance_snapshots', columns: () => this.columns }),
      {
        field: 'rules',
        title: i18n.t('table.title.sub_snapshot'),
        minWidth: 220,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.snapshots) return [<data-loading />]
            const len = (row.snapshots && row.snapshots.length) || 0
            if (len === 0) return i18n.t('compute.text_619', [len])
            const list = row.snapshots.map(val => (
              <a-tag class='mb-2 mr-1'>{ val.name }</a-tag>
            ))
            return [<list-body-cell-popover text={i18n.t('compute.text_619', [len])} max-width="400px">
              <div style="display: inline-flex; flex-wrap: wrap; max-width: 40vw;">
                {...list}
              </div>
            </list-body-cell-popover>]
          },
        },
        formatter: ({ row }) => {
          const { snapshots = [] } = row
          const len = snapshots.length
          const list = snapshots.map(item => item.name)
          if (len) {
            return `${i18n.t('compute.text_619', [len])}(${list.join(',')})`
          }
          return ''
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
        field: 'size_mb',
        title: i18n.t('table.title.snapshot_size'),
        width: 70,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.size_mb) return [<data-loading />]
            return sizestr(row.size_mb, 'M', 1024)
          },
        },
        formatter: ({ row }) => {
          return sizestr(row.size_mb, 'M', 1024)
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
        formatter: ({ row }) => row.guest,
      },
      getBrandTableColumn(),
      getTimeTableColumn(),
      getProjectTableColumn(),
    ]
  },
}
