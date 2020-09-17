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
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'storage', columns: () => this.columns }),
      {
        field: 'capacity',
        title: i18n.t('storage.text_42'),
        width: 100,
        formatter: ({ row }) => {
          return sizestr(row.capacity, 'M', 1024)
        },
      },
      {
        field: 'virtual_capacity',
        title: i18n.t('storage.text_43'),
        width: 100,
        formatter: ({ row }) => {
          if (!row.virtual_capacity) return '-'
          return sizestr(row.virtual_capacity, 'M', 1024)
        },
      },
      {
        field: 'used_capacity',
        title: i18n.t('storage.text_44'),
        width: 100,
        formatter: ({ row }) => {
          if (!row.used_capacity) return '-'
          return sizestr(row.used_capacity, 'M', 1024)
        },
      },
      getEnabledTableColumn(),
      getStatusTableColumn({ statusModule: 'blockstorage' }),
      {
        field: 'storage_type',
        title: i18n.t('storage.text_38'),
        width: 100,
        formatter: ({ row }) => {
          return STORAGE_TYPES[row.storage_type] || row.storage_type
        },
      },
      getPublicScopeTableColumn({ vm: this, resource: 'storages' }),
      getProjectDomainTableColumn(),
      getBrandTableColumn(),
      {
        field: 'medium_type',
        title: i18n.t('storage.text_39'),
        width: 120,
        formatter: ({ row }) => {
          return MEDIUM_TYPES[row.medium_type] || row.medium_type
        },
      },
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
      getRegionTableColumn(),
    ]
  },
}
