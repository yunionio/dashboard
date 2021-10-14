<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'DomainList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'domains',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: {
            label: this.$t('system.text_101'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('system.text_101'), key: 'name' },
          { label: this.$t('system.text_163'), key: 'enabled' },
          { label: this.$t('system.text_164'), key: 'status' },
          { label: this.$t('system.text_165'), key: 'idp' },
        ],
      },
      groupActions: [
        {
          label: this.$t('system.text_128'),
          action: () => {
            this.$router.push('/domain/create')
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('system.text_166'),
          actions: () => {
            return [
              ...getEnabledSwitchActions(this, undefined, undefined, {
                actions: [
                  () => {
                    this.list.batchUpdate(this.list.selectedItems.map(({ id }) => id), {
                      enabled: true,
                    })
                  },
                  () => {
                    this.list.batchUpdate(this.list.selectedItems.map(({ id }) => id), {
                      enabled: false,
                    })
                  },
                ],
              }),
              {
                label: this.$t('table.action.set_tag'),
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    params: {
                      resources: 'domain',
                    },
                    mode: 'add',
                  })
                },
              },
              {
                label: this.$t('system.text_129'),
                action: (row) => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('system.text_129'),
                    name: this.$t('dictionary.domain'),
                    onManager: this.onManager,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: () => {
            return {
              validate: !!this.list.selectedItems.length,
            }
          },
        },
      ],
    }
  },
  computed: mapGetters(['isAdminMode', 'l3PermissionEnable', 'globalConfig']),
  created () {
    // if (!this.l3PermissionEnable) {
    //   this.singleActions.splice(0, 1)
    // }
    this.initSidePageTab('detail')
    this.list.fetchData()
    this.$bus.$on('SystemDomainsListRefresh', args => {
      this.list.refresh()
    }, this)
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DomainSidePage', {
        id: row.id,
        resource: 'domains',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
