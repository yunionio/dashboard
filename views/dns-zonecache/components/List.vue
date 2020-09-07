<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DnsZonecacheList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    data: {
      type: Object,
    },
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'dns_zonecaches',
        getParams: {
          ...this.getParams,
          details: true,
        },
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          action: () => {
            this.createDialog('DnsZonecacheCreateDialog', {
              title: this.$t('common_699'),
              resData: this.data,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: this.isPublicZone,
            }
          },
        },
      ],
    }
  },
  computed: {
    isPublicZone () {
      return this.data.zone_type === 'PublicZone'
    },
  },
  created () {
    this.initSidePageTab('dns-zonecache-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DnsZonecacheSidePage', {
        id: row.id,
        resource: 'dns_zonecaches',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
