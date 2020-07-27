<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'RelatedResourceTagListSidePage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        key: 'id',
        resource: () => this.fetchData(),
        getParams: {},
        responseData: this.responseData,
      }),
      columns: [
        {
          field: 'name',
          title: this.$t('cloudenv.text_95'),
        },
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
                this.fetchData(labels)
                this.list.fetchData()
              },
            })
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('cloudenv.text_454'),
          permission: 'scheduledtasks_perform_set_label',
          action: () => {
            this.createDialog('ScheduledtaskEditDialog', {
              data: [this.data],
              columns: this.columns,
              onManager: this.onManager,
              success: (labels) => {
                this.fetchData(labels)
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
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.$bus.$on('RelatedResourceTagListSidePageRefresh', labels => {
      this.fetchData(labels)
      this.list.fetchData()
    }, this)
  },
  methods: {
    fetchData (labels) {
      const response = { data: {} }
      const data = (labels || this.data.labels).map((k) => {
        return {
          id: k,
          name: `${k}`,
        }
      })
      response.data.data = data
      this.list.responseData = { data }
      return response
    },
  },
}
</script>
