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
import { NOTIFY_TOPIC_NAMES_MAP, NOTIFY_TOPIC_TYPES_MAP } from '@IAM/constants'
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'TopicDetail',
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
      ],
    }
  },
}
</script>

<style scoped>

</style>
