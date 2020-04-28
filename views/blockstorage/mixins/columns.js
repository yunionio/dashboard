import _ from 'lodash'
import { STORAGE_TYPES, MEDIUM_TYPES } from '@Storage/constants/index.js'
import { sizestr } from '@/utils/utils'
import { getNameDescriptionTableColumn, getEnabledTableColumn, getStatusTableColumn, getBrandTableColumn, getPublicScopeTableColumn, getProjectDomainTableColumn } from '@/utils/common/tableColumn'

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
      {
        field: 'capacity',
        title: '实际容量',
        width: 100,
        formatter: ({ row }) => {
          return sizestr(row.capacity, 'M', 1024)
        },
      },
      {
        field: 'virtual_capacity',
        title: '虚拟容量',
        width: 100,
        formatter: ({ row }) => {
          if (!row.virtual_capacity) return '-'
          return sizestr(row.virtual_capacity, 'M', 1024)
        },
      },
      {
        field: 'used_capacity',
        title: '分配',
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
        title: '存储类型',
        width: 100,
        formatter: ({ row }) => {
          return STORAGE_TYPES[row.storage_type] || row.storage_type
        },
      },
      getPublicScopeTableColumn({ vm: this }),
      getProjectDomainTableColumn(),
      getBrandTableColumn(),
      {
        field: 'medium_type',
        title: '介质类型',
        width: 120,
        formatter: ({ row }) => {
          return MEDIUM_TYPES[row.medium_type] || row.medium_type
        },
      },
      {
        field: 'schedtag',
        title: '调度标签',
        width: 120,
        type: 'expand',
        slots: {
          content: ({ row }) => {
            let tags = _.sortBy(row.schedtags, ['default', 'name'])
            if (tags.length > 0) {
              return tags.map(tag => <a-tag class='mb-2' color='blue'>{tag.name}</a-tag>)
            }
            return [
              <div class='text-color-help'>无调度标签</div>,
            ]
          },
        },
      },
    ]
  },
}
