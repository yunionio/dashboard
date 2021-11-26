<template>
  <page-list
      :list="list"
      :columns="columns"
      :single-actions="singleActions"
      :group-actions="groupActions"
      :export-data-options="exportDataOptions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getDescriptionFilter } from '@/utils/common/tableFilter'

export default {
  name: 'SshAgentList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'proxy_agents',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          description: getDescriptionFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
        ],
      },
      groupActions: [],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
  },
  created () {
    this.initSidePageTab('SshAgent-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {}
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SshAgentSidePage', {
        id: row.id,
        resource: 'proxy_agents',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
