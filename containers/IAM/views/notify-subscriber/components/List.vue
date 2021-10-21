<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { NOTIFY_SUBSCRIBER_TYPES_MAP } from '../../../constants'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getEnabledFilter } from '@/utils/common/tableFilter'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  name: 'NotifySubscriberList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: {
      type: String,
    },
    resId: {
      type: String,
    },
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'subscribers',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          resource_scope: {
            label: this.$t('system.notify.topic.receiver.resource_scope'),
            dropdown: true,
            distinctField: {
              type: 'extra_field',
              key: 'resource_scope',
            },
          },
          enabled: getEnabledFilter(),
          type: {
            label: this.$t('system.text_48'),
            filter: true,
            dropdown: true,
            distinctField: {
              type: 'field',
              key: 'type',
              getParams: this.getParam,
            },
            formatter: val => {
              return `type.contains("${val}")`
            },
            mapper: list => {
              return list.map(({ key, label }) => {
                return {
                  key,
                  label: NOTIFY_SUBSCRIBER_TYPES_MAP[key] ? NOTIFY_SUBSCRIBER_TYPES_MAP[key].label : label,
                }
              })
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: this.$t('system.notify.topic.receiver.resource_scope'), key: 'resource_scope' },
          { label: this.$t('system.text_163'), key: 'enabled' },
          { label: this.$t('system.text_48'), key: 'type' },
          // todo: 接收对象
        ],
      },
      groupActions: [
        // 新建
        {
          label: this.$t('system.text_128'),
          permission: 'subscribers_create',
          action: () => {
            this.createDialog('SetupNotifyReceiverDialog', {
              resId: this.resId,
              columns: this.columns,
              success: (res) => {
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('common.batchAction'),
          actions: obj => {
            return [
              // 启用禁用
              ...getEnabledSwitchActions(this, undefined, undefined, {
                resourceName: this.$t('system.notify.subscriber.receivers'),
                fields: ['resource_scope', 'enabled', 'type', 'receivers'],
                actions: [
                  async (obj) => {
                    const ids = this.list.selectedItems.map(item => item.id)
                    await this.onManager('batchPerformAction', {
                      id: ids,
                      managerArgs: {
                        action: 'enable',
                      },
                    })
                  },
                  async (obj) => {
                    const ids = this.list.selectedItems.map(item => item.id)
                    await this.onManager('batchPerformAction', {
                      id: ids,
                      managerArgs: {
                        action: 'disable',
                      },
                    })
                  },
                ],
              }),
              // 删除
              {
                label: this.$t('system.text_129'),
                permission: 'subscribers_delete',
                fields: ['resource_scope', 'enabled', 'type', 'receivers'],
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    fields: ['resource_scope', 'enabled', 'type', 'receivers'],
                    title: this.$t('common.delete'),
                    name: this.$t('system.notify.subscriber.receivers'),
                    onManager: this.onManager,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: () => {
            let validate = true
            if (this.list.selectedItems.length <= 0) {
              validate = false
            }

            return { validate }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        topic_id: this.resId,
        details: true,
      }
      return ret
    },
  },
}
</script>

<style scoped>

</style>
