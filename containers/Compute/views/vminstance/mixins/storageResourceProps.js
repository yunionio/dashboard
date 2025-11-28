import _ from 'lodash'
import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getRegionTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
} from '@/utils/common/tableFilter'
import { sizestr } from '@/utils/utils'
import { STORAGE_TYPES, MEDIUM_TYPES } from '@Storage/constants'

export default {
  computed: {
    resourceProps () {
      return {
        list: this.$list.createList(this, {
          id: 'VmStoragesListForChangeBlockStorageDialog',
          resource: 'storages',
          getParams: {
            host_id: this.selectedItems[0].host_id,
            filter: `id.notin(${this.selectedItemsStorageIds.join(',')})`,
          },
          filterOptions: {
            id: {
              label: this.$t('table.title.id'),
            },
            name: getNameFilter(),
          },
        }),
        columns: [
          getNameDescriptionTableColumn({
            hideField: true,
            addLock: true,
            addBackup: true,
            edit: false,
            editDesc: false,
            minWidth: 120,
            slotCallback: row => {
              return [
                <list-body-cell-wrap field='name' row={row} />,
              ]
            },
          }),
          getStatusTableColumn({
            statusModule: 'blockstorage',
            minWidth: 100,
          }),
          getEnabledTableColumn(),
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
            title: this.$t('storage.text_43'),
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
            title: this.$t('storage.text_38'),
            width: 100,
            formatter: ({ row }) => {
              return STORAGE_TYPES[row.storage_type] || row.storage_type
            },
          },
          {
            field: 'medium_type',
            title: this.$t('storage.text_39'),
            width: 120,
            formatter: ({ row }) => {
              return MEDIUM_TYPES[row.medium_type] || row.medium_type
            },
          },
          getBrandTableColumn(),
          {
            field: 'schedtag',
            title: this.$t('storage.text_45'),
            width: 120,
            slots: {
              default: ({ row }) => {
                const tags = _.sortBy(row.schedtags, ['default', 'name'])
                if (!tags.length) {
                  return [
                    <div class='text-color-help'>{ this.$t('storage.text_171') }</div>,
                  ]
                }
                const list = tags.map(tag => <a-tag class='mb-2 mr-1' color='blue'>{tag.name}</a-tag>)
                return [<list-body-cell-popover text={this.$t('compute.text_619', [tags.length])} max-width="400px">
                  <div style="display: inline-flex; flex-wrap: wrap; max-width: 40vw;">
                    {...list}
                  </div>
                </list-body-cell-popover>]
              },
            },
          },
          getPublicScopeTableColumn({ vm: this, resource: 'storages' }),
          getProjectDomainTableColumn(),
          getRegionTableColumn(),
          getTimeTableColumn(),
        ],
      }
    },
  },
  methods: {},
}
