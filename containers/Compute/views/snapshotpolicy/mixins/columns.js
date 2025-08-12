import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
  getProjectTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import { weekOptions, timeOptions } from '../constants'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row, 'detail') }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'snapshotpolicy', vm: this }),
      getTagTableColumn({ onManager: this.onManager, resource: 'snapshotpolicy', columns: () => this.columns }),
      getBrandTableColumn(),
      getAccountTableColumn(),
      {
        field: 'type',
        title: i18n.t('common.resource_type'),
        formatter: ({ row }) => {
          return row.type === 'server' ? i18n.t('dictionary.server') : i18n.t('dictionary.disk')
        },
      },
      {
        field: 'binding_disk_count',
        title: i18n.t('compute.bind_resource_count'),
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            if (row.binding_disk_count === undefined) return [<data-loading />]
            if (row.type === 'server') {
              if (row.binding_resource_count <= 0) return row.binding_resource_count
              return [
                <side-page-trigger name='SnapshotPolicySidePage' id={row.id} tab='snapshot-policy-server' vm={this}>{row.binding_resource_count}</side-page-trigger>,
              ]
            }
            if (row.binding_disk_count <= 0) return row.binding_disk_count
            return [
              <side-page-trigger name='SnapshotPolicySidePage' id={row.id} tab='snapshot-policy-disk' vm={this}>{row.binding_disk_count}</side-page-trigger>,
            ]
          },
        },
      },
      {
        field: 'repeat_weekdays',
        title: i18n.t('table.title.strategy'),
        minWidth: 180,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }, h) => {
            if (row.repeat_weekdays === undefined) return [<data-loading />]
            let text = ''
            if (row.repeat_weekdays && row.repeat_weekdays.length) {
              text += i18n.t('compute.text_1098') + row.repeat_weekdays.map(item => weekOptions[item - 1]).join('、')
            }
            if (row.time_points && row.time_points.length) {
              text += '; ' + row.time_points.map(item => timeOptions[item]).join('、')
            }
            if (text) {
              text += i18n.t('compute.text_1099')
            }
            return [
              <list-body-cell-wrap copy field='repeat_weekdays' hideField row={row} message={text}>
                {{ text }}
              </list-body-cell-wrap>,
            ]
          },
        },
      },
      getRegionTableColumn(),
      getTimeTableColumn(),
      getProjectTableColumn(),
    ]
  },
}
