<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import {
  getNameFilter,
} from '@/utils/common/tableFilter'

export default {
  name: 'ContainerRegistry',
  props: {
    id: String,
    resId: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'containerRegistryListId',
        resource: `container_registries/${this.resId}/image-tags`,
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      columns: [
        {
          field: 'name',
          title: this.$t('k8s.repo.image.name'),
          minWidth: 240,
          slots: {
            default: ({ row }, h) => {
              return row.name
            },
          },
        },
        {
          field: 'version',
          title: this.$t('k8s.repo.image.tag'),
          width: 220,
          type: 'expand',
          slots: {
            default: ({ row }) => {
              if (this.isPreLoad && !row.tags) return [<data-loading />]
              const len = (row.tags && row.tags.length) || 0
              return this.$t('compute.text_619', [len])
            },
            content: ({ row }, h) => {
              return row.tags.map(v => <a-tag>{{ v }}</a-tag>)
            },
          },
        },
      ],
      groupActions: [],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
