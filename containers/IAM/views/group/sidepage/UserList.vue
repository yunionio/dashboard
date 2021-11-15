<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import {
  getEnabledTableColumn,
  getProjectDomainTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'GroupUserList',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    id: String,
    getParams: {
      type: Object,
    },
    onManager: Function,
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: `groups/${this.resId}/users`,
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('system.text_101'),
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
          { label: this.$t('dictionary.user'), key: 'name' },
          { label: this.$t('system.text_163'), key: 'enabled' },
          { label: this.$t('table.title.owner_domain'), key: 'project_domain' },
        ],
      },
      columns: [
        {
          title: this.$t('dictionary.user'),
          field: 'name',
          slots: {
            default: ({ row }, h) => {
              return [
                <list-body-cell-wrap copy row={row} field='name' title={row.name} message={row.name} hideField={true}>
                  <side-page-trigger permission='users_get' name='UserSidePage' id={row.id} vm={this}>{ row.name }</side-page-trigger>
                </list-body-cell-wrap>,
              ]
            },
          },
        },
        getEnabledTableColumn(),
        getProjectDomainTableColumn(),
      ],
      groupActions: [
        {
          label: this.$t('system.text_452', [this.$t('dictionary.user')]),
          action: () => {
            this.createDialog('GroupJoinUserDialog', {
              data: [this.data],
              columns: [
                getNameDescriptionTableColumn({
                  onManager: this.onManager,
                  hideField: true,
                  slotCallback: row => {
                    return (
                      <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
                    )
                  },
                  formRules: [{
                    required: true,
                    message: i18n.t('system.text_168'),
                    whitespace: true,
                  }],
                }),
                getProjectDomainTableColumn(),
              ],
              title: this.$t('system.text_452', [this.$t('dictionary.user')]),
              success: () => {
                this.list.refresh()
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('compute.text_950'),
          action: () => {
            this.createDialog('GroupLeaveUserDialog', {
              title: this.$t('system.text_525'),
              data: this.list.selectedItems,
              resItem: this.data,
              columns: this.columns,
              success: () => {
                this.list.refresh()
              },
            })
          },
          meta: () => ({
            validate: this.list.selectedItems.length > 0,
          }),
        },
      ],
      singleActions: [
        {
          label: this.$t('compute.text_950'),
          action: (obj) => {
            this.createDialog('GroupLeaveUserDialog', {
              title: this.$t('compute.text_950'),
              data: [obj],
              resItem: this.data,
              columns: this.columns,
              success: () => {
                this.list.refresh()
              },
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.$bus.$on('GroupUserListRefresh', () => {
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
  },
}
</script>
