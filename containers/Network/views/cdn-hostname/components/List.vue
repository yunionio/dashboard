<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :group-actions="groupActions"
    :showGroupActions="showGroupActions"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'CustomHostnameList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
    cdnId: {
      type: String,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: `cdn_domains/${this.cdnId}/custom-hostnames`,
        getParams: this.getParam,
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          hostname: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `hostname.contains("${val}")`
            },
          },
        },
        hiddenColumns: ['created_at'],
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.createDialog('CdnHostnameCreateDialog', {
              onManager: this.onManager,
              data: [],
              cdnDomainId: this.cdnId,
              success: () => {
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: true,
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
    exportDataOptions () {
      return {
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
        downloadType: 'local',
        title: this.$t('dictionary.cdn_domain'),
      }
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        detail: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CdnHostnameSidePage', {
        id: row.id,
        resource: () => {
          return {
            data: row,
          }
        },
      }, {
        list: this.list,
      })
    },
  },
}
</script>
