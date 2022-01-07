import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBillingTableColumn,
  getProjectTableColumn,
  getAccountTableColumn,
  getBrandTableColumn,
  getTagTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'

import i18n from '@/locales'
import { KAFKA_STORAGE } from '../constants/index.js'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        addBackup: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'kafkas', columns: () => this.columns }),
      getStatusTableColumn({ statusModule: 'kafka' }),
      {
        field: 'version',
        title: i18n.t('middleware.version'),
        width: 100,
      },
      {
        field: 'storage_type',
        title: i18n.t('middleware.storage'),
        width: 100,
        slots: {
          default: ({ row }) => {
            return [<div>
              <div>{KAFKA_STORAGE[row.storage_type] || row.storage_type || '-'}</div>
              <div>{i18n.t('middleware.size_gb', [row.disk_size_gb])}</div>
            </div>]
          },
        },
      },
      {
        field: 'bandwidth_mb',
        title: i18n.t('middleware.bandwidth'),
        slots: {
          default: ({ row }) => {
            if (row.bandwidth_mb && row.bandwidth_mb !== 0) {
              return i18n.t('middleware.bandwidth_mb', [row.bandwidth_mb])
            }
            return '-'
          },
        },
      },
      {
        field: 'endpoint',
        title: i18n.t('middleware.endpoint'),
        slots: {
          default: ({ row }) => {
            return row.endpoint || '-'
          },
        },
      },
      {
        field: 'msg_retention_minute',
        title: i18n.t('middleware.msg_retention_minute'),
        slots: {
          default: ({ row }) => {
            if (row.msg_retention_minute && row.msg_retention_minute !== 0) {
              if (row.msg_retention_minute / 60 > 0) {
                return i18n.t('middleware.hours', [row.msg_retention_minute / 60])
              }
              return i18n.t('middleware.minutes', [row.msg_retention_minute])
            }
            return '-'
          },
        },
      },
      getBillingTableColumn({ vm: this }),
      getBrandTableColumn(),
      getAccountTableColumn(),
      getProjectTableColumn(),
      getRegionTableColumn({ showOverflow: false }),
    ]
  },
}
