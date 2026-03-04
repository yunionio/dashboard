<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="credentials" />
</template>

<script>
import { getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'ContainerSecretDetail',
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
          title: this.$t('common.name'),
        },
        {
          field: 'type',
          title: this.$t('common.type'),
        },
        getTimeTableColumn({
          field: 'created_at',
          title: this.$t('common.created_at'),
        }),
      ],
      extraInfo: [
        {
          field: 'blob',
          title: this.$t('aice.container_secret'),
          slots: {
            default: ({ row }, h) => {
              const blob = row.blob
              if (!blob) return '-'
              let obj = blob
              if (typeof blob === 'string') {
                try {
                  obj = JSON.parse(blob)
                } catch (e) {
                  return blob
                }
              }
              if (typeof obj !== 'object' || obj === null) return '-'
              const entries = Object.entries(obj)
              if (entries.length === 0) return '-'
              return h('div', { class: 'container-secret-blob' }, entries.map(([k, v]) =>
                h('div', { key: k, class: 'blob-row' }, [
                  h('span', { class: 'blob-key' }, k),
                  h('span', { class: 'blob-sep' }, ': '),
                  h('span', { class: 'blob-value' }, String(v)),
                ]),
              ))
            },
          },
        },
      ],
    }
  },
}
</script>

<style scoped>
.container-secret-blob {
  word-break: break-all;
}
.blob-row {
  margin-bottom: 4px;
}
.blob-key {
  font-weight: 500;
  color: #1890ff;
}
.blob-sep {
  margin: 0 4px;
}
.blob-value {
  color: #333;
}
</style>
