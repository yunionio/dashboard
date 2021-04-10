<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { statusMap } from '../../constants'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { PROCESS_TYPES_OPTS } from '@/constants/workflow'

export default {
  name: 'AllProcessList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    listId: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        resource: 'historic-process-instances',
        apiVersion: 'v1',
        getParams: this.getParam,
        sortKeys: ['create_time'],
        filterOptions: {
          id: {
            label: this.$t('common_350'),
          },
          initiator_name: {
            label: this.$t('common_371'),
          },
          status: {
            label: this.$t('common.status'),
            dropdown: true,
            items: Object.keys(statusMap).map((v) => {
              return {
                label: statusMap[v],
                key: v,
              }
            }),
          },
          process_definition_key: {
            label: this.$t('common_375'),
            dropdown: true,
            items: PROCESS_TYPES_OPTS.map((v) => {
              return {
                label: v.name,
                key: v.value,
              }
            }),
          },
          resource_name: {
            label: this.$t('common_151'),
          },
          resource_project: {
            label: this.$t('common_310'),
          },
        },
      }),
      groupActions: [],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.initSidePageTab('all-process-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        ...this.getParams,
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AllProcessSidePage', {
        id: row.id,
        resource: 'historic-process-instances',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
