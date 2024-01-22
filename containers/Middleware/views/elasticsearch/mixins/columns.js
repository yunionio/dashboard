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
import { ELK_STORAGE, ELK_CATEGORY } from '../constants/index.js'

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
      getTagTableColumn({ onManager: this.onManager, resource: 'elastic_searchs', columns: () => this.columns }),
      getStatusTableColumn({ statusModule: 'elasticSearch' }),
      {
        field: 'category',
        title: i18n.t('middleware.category'),
        width: 100,
        formatter: ({ row }) => {
          return ELK_CATEGORY[row.category] || row.category || '-'
        },
      },
      {
        field: 'vcpu_count',
        title: i18n.t('middleware.config'),
        width: 120,
        slots: {
          default: ({ row }) => {
            return [<div>
              <div>{i18n.t('middleware.config_size', [row.vcpu_count, row.vmem_size_gb])}</div>
              <div>{row.instance_type || '-'}</div>
            </div>]
          },
        },
        formatter: ({ row }) => {
          return `${i18n.t('middleware.config_size', [row.vcpu_count, row.vmem_size_gb])},row.instance_type || '-'`
        },
      },
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
              <div>{ELK_STORAGE[row.storage_type] || row.storage_type || '-'}</div>
              <div>{i18n.t('middleware.size_gb', [row.disk_size_gb])}</div>
            </div>]
          },
        },
        formatter: ({ row }) => {
          return `${ELK_STORAGE[row.storage_type] || row.storage_type || '-'},i18n.t('middleware.size_gb', [row.disk_size_gb])`
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
