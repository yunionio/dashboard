<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { getNameDescriptionTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import { getStatusFilter, getHostFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { RES_SIDEPAGE_MAP } from '../constants'

export default {
  name: 'RelatedResourceServerListSidePage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    data: {
      type: Object,
    },
    params: {
      type: Object,
    },
  },
  data () {
    const labels = this.data.labels || []
    return {
      list: this.$list.createList(this, {
        id: this.id,
        key: 'id',
        resource: `${this.data.resource_type}s`,
        getParams: {
          filter: `id.in(${labels.join(',')})`,
          ...this.params,
        },
        steadyStatus: Object.values(expectStatus.scalingserver).flat().concat(Object.values(expectStatus.server).flat()),
        filterOptions: {
          name: {
            label: this.$t('cloudenv.text_95'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter(this.data.resource_type),
          host: getHostFilter(),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          addLock: true,
          addBackup: true,
          formRules: [
            { required: true, message: this.$t('cloudenv.text_190') },
            { validator: this.$validate('serverCreateName') },
          ],
          slotCallback: row => {
            return (
              <side-page-trigger permission={`${this.data.resource_type}_get`} name={RES_SIDEPAGE_MAP[this.data.resource_type]} id={row.id} vm={this}>{ row.name }</side-page-trigger>
            )
          },
        }),
        getStatusTableColumn({ title: this.$t('cloudenv.text_98'), statusModule: this.data.resource_type, width: 130 }),
      ],
      singleActions: [
        {
          label: this.$t('cloudenv.text_452'),
          permission: 'scheduledtasks_perform_set_label',
          action: (row) => {
            this.createDialog('RelatedResourceRemoveDialog', {
              title: this.$t('cloudenv.text_452'),
              data: [row],
              resData: this.data,
              columns: this.columns,
              refresh: this.refresh,
              onManager: this.onManager,
              success: (labels) => {
                this.list.getParams = {
                  filter: `id.in(${labels.join(',')})`,
                }
                this.list.fetchData()
              },
            })
          },
        },
      ],
      groupActions: [
        // {
        //   label: this.$t('cloudenv.text_454'),
        //   permission: 'scheduledtasks_perform_set_label',
        //   action: () => {
        //     this.createDialog('ScheduledtaskEditDialog', {
        //       data: [this.data],
        //       columns: this.columns,
        //       onManager: this.onManager,
        //       title: this.$t('cloudenv.text_454'),
        //       success: (labels) => {
        //         this.list.getParams = {
        //           filter: `id.in(${labels.join(',')})`,
        //         }
        //         this.list.fetchData()
        //       },
        //     })
        //   },
        //   meta: () => {
        //     return {
        //       buttonType: 'primary',
        //     }
        //   },
        // },
        {
          label: this.$t('cloudenv.text_452'),
          permission: 'scheduledtasks_perform_set_label',
          action: () => {
            this.createDialog('RelatedResourceRemoveDialog', {
              title: this.$t('cloudenv.text_452'),
              data: this.list.selectedItems,
              resData: this.data,
              columns: this.columns,
              // refresh: this.refresh,
              onManager: this.onManager,
              success: (labels) => {
                this.list.getParams = {
                  filter: `id.in(${labels.join(',')})`,
                }
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            return ret
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.$bus.$on('RelatedResourceServerListSidePageRefresh', labels => {
      this.list.getParams = {
        filter: `id.in(${labels.join(',')})`,
      }
      this.list.fetchData()
    }, this)
  },
}
</script>
