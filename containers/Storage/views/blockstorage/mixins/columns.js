import _ from 'lodash'
import { STORAGE_TYPES, MEDIUM_TYPES } from '@Storage/constants/index.js'
import { sizestr } from '@/utils/utils'
import { getNameDescriptionTableColumn, getEnabledTableColumn, getStatusTableColumn, getBrandTableColumn, getPublicScopeTableColumn, getProjectDomainTableColumn, getTagTableColumn, getRegionTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name_cn ? `${row.name}(${row.name_cn})` : row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'blockstorage' }),
      getEnabledTableColumn(),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'storage', columns: () => this.columns, tipName: this.$t('dictionary.blockstorage') }),
      {
        field: 'capacity',
        title: this.$t('storage.text_177'),
        width: 180,
        slots: {
          default: ({ row }, h) => {
            const capacity = sizestr(row.capacity, 'M', 1024)
            const allowedBrands = ['VMware', 'OneCloud']
            const actual_capacity_used = allowedBrands.includes(row.brand) ? sizestr(row.actual_capacity_used, 'M', 1024) : '-'
            return [<div>
              <div>{this.$t('storage.text_178', [actual_capacity_used])}</div>
              <div>{this.$t('storage.text_180', [capacity])}</div>
            </div>]
          },
        },
      },
      {
        field: 'virtual_capacity',
        title: i18n.t('storage.text_43'),
        width: 180,
        slots: {
          default: ({ row }, h) => {
            const virtual_capacity = sizestr(row.virtual_capacity, 'M', 1024)
            const used_capacity = sizestr(row.used_capacity, 'M', 1024)
            return [<div>
              <div>{this.$t('storage.text_181', [used_capacity])}</div>
              <div>{this.$t('storage.text_180', [virtual_capacity])}</div>
            </div>]
          },
        },
      },
      {
        field: 'storage_type',
        title: i18n.t('storage.text_38'),
        width: 100,
        formatter: ({ row }) => {
          return STORAGE_TYPES[row.storage_type] || row.storage_type
        },
      },
      {
        field: 'medium_type',
        title: i18n.t('storage.text_39'),
        width: 120,
        formatter: ({ row }) => {
          return MEDIUM_TYPES[row.medium_type] || row.medium_type
        },
      },
      getBrandTableColumn(),
      {
        field: 'schedtag',
        title: i18n.t('storage.text_45'),
        width: 120,
        type: 'expand',
        slots: {
          content: ({ row }) => {
            const tags = _.sortBy(row.schedtags, ['default', 'name'])
            if (tags.length > 0) {
              return tags.map(tag => <a-tag class='mb-2' color='blue'>{tag.name}</a-tag>)
            }
            return [
              <div class='text-color-help'>{ this.$t('storage.text_171') }</div>,
            ]
          },
        },
      },
      getPublicScopeTableColumn({ vm: this, resource: 'storages' }),
      getProjectDomainTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
