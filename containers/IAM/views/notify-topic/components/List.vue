<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { mapGetters } from 'vuex'
import { NOTIFY_TOPIC_TYPES_MAP } from '@IAM/constants'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getEnabledFilter } from '@/utils/common/tableFilter'

export default {
  name: 'NotifyTopicList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => {},
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'topics',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
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
                  label: NOTIFY_TOPIC_TYPES_MAP[key] ? NOTIFY_TOPIC_TYPES_MAP[key].label : label,
                }
              })
            },
          },
          enabled: getEnabledFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('system.text_126'), key: 'name' },
          { label: this.$t('system.text_48'), key: 'type' },
          { label: this.$t('system.text_163'), key: 'enabled' },
        ],
      },
      groupActions: [
        {
          label: this.$t('system.text_225'),
          action: () => {
            this.createDialog('DisableDialog', {
              title: this.$t('system.text_225'),
              name: this.$t('dictionary.notify-topic'),
              columns: this.columns,
              data: this.list.selectedItems,
              ok: async () => {
                try {
                  const response = await this.list.batchPerformAction('enable', null)
                  return response
                } catch (error) {
                  throw error
                }
              },
            })
          },
          meta: () => {
            let validate = true
            if (this.list.selectedItems.length <= 0) {
              validate = false
            }
            if (this.list.selectedItems.some(item => item.enabled === true)) {
              validate = false
            }
            if (!this.isAdminMode) {
              validate = false
            }
            return {
              validate,
            }
          },
        },
        {
          label: this.$t('system.text_226'),
          action: () => {
            this.createDialog('DisableDialog', {
              title: this.$t('system.text_226'),
              name: this.$t('dictionary.notify-topic'),
              columns: this.columns,
              data: this.list.selectedItems,
              ok: async () => {
                try {
                  const response = await this.list.batchPerformAction('disable', null)
                  return response
                } catch (error) {
                  throw error
                }
              },
            })
          },
          meta: () => {
            let validate = true
            if (this.list.selectedItems.length <= 0) {
              validate = false
            }
            if (this.list.selectedItems.some(item => item.enabled === false)) {
              validate = false
            }
            if (!this.isAdminMode) {
              validate = false
            }
            return {
              validate,
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        ...this.getParams,
        details: true,
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'NotifyTopicSidePage', {
        id: row.id,
        resource: 'topics',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

<style scoped>

</style>
