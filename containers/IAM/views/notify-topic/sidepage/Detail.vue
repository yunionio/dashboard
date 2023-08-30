<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :hiddenKeys="['external_id', 'type', 'project_domain', 'tenant', 'status']"
    :show-name="false"
    :show-desc="false"
    :is-edit-name="!data.is_system"
    :is-edit-desc="!data.is_system" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ColumnsMixin from '../mixins/columns'
import { NOTIFY_TOPIC_NAMES_MAP, NOTIFY_TOPIC_TYPES_MAP } from '@IAM/constants'
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'TopicDetail',
  mixins: [WindowsMixin, ColumnsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'name',
          title: this.$t('system.notify.topic.name'),
          formatter: ({ row }) => {
            return NOTIFY_TOPIC_NAMES_MAP[row.name] || row.name || '-'
          },
        },
        {
          field: 'topic-type',
          title: this.$t('system.notify.topic.type'),
          formatter: ({ row }) => {
            return NOTIFY_TOPIC_TYPES_MAP[row.type] ? NOTIFY_TOPIC_TYPES_MAP[row.type].label : '-'
          },
        },
        getEnabledTableColumn(),
      ],
      extraInfo: [
        {
          title: this.$t('system.notify.topic.resources'),
          items: [
            {
              field: 'resource_types',
              title: this.$t('scope.text_653'),
              slots: {
                default: ({ row }) => {
                  if (!row.resource_types) return []
                  const ret = []
                  for (const r of row.resource_types) {
                    ret.push(<div>{this.$t(`dictionary.${r}`)}</div>)
                  }
                  return ret
                },
              },
            },
          ],
        },
        {
          title: this.$t('iam.notify_time'),
          items: [
            {
              field: 'advance_days',
              title: this.$t('iam.notify_time'),
              slots: {
                default: ({ row }) => {
                  const { advance_days = [] } = row
                  if (!advance_days.length) return '-'
                  const ret = []
                  if (advance_days.length === 1) {
                    ret.push(<span>{this.$t('iam.notify_one_day', [this.$t('iam.notify_time.some_day', [advance_days[0]])])}</span>)
                  } else {
                    const dayList = []
                    advance_days.map(day => {
                      dayList.push(this.$t('iam.notify_time.some_day', [day]))
                    })
                    ret.push(<span>{this.$t('iam.notify_some_day', [dayList.join('、')])}</span>)
                  }
                  ret.push(<a-icon type='edit' class='edit-icon primary-color ml-2' onclick={this.updateNotifyTime} />)
                  return ret
                },
              },
            },
          ],
          hidden: () => !['resource release', 'password expire'].includes(this.data.name),
        },
      ],
    }
  },
  methods: {
    updateNotifyTime () {
      this.createDialog('NotifyTopicUpdateTimeDialog', {
        onManager: this.onManager,
        data: [this.data],
        columns: this.columns,
      })
    },
  },
}
</script>

<style scoped>

</style>
