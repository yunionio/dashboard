<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'UserSidepageAllProjects',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: this.getList,
        apiVersion: 'v1',
      }),
      columns: [
        {
          title: this.$t('dictionary.group'),
          field: 'name',
          slots: {
            default: ({ row }) => {
              return [
                <list-body-cell-wrap copy row={row} field='name' title={row.name} message={row.name} hideField={true}>
                  <side-page-trigger permission='groups_get' name='GroupSidePage' id={row.id} vm={this}>{ row.name }</side-page-trigger>
                </list-body-cell-wrap>,
              ]
            },
          },
        },
        {
          title: this.$t('dictionary.domain'),
          field: 'project_domain',
        },
      ],
      groupActions: [
        {
          label: this.$t('system.text_195', [this.$t('dictionary.group')]),
          permission: 'users_perform_join',
          action: () => {
            this.createDialog('UserGroupJoinDialog', {
              onManager: this.onManager,
              data: [this.data],
              resItem: this.data,
              title: this.$t('system.text_195', [this.$t('dictionary.group')]),
              columns: [
                getNameDescriptionTableColumn({
                  hideField: true,
                  formRules: [
                    { required: true, message: i18n.t('system.text_168') },
                  ],
                  edit: row => row.idp_driver !== 'ldap',
                  slotCallback: row => {
                    return (
                      <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
                    )
                  },
                }),
                getProjectDomainTableColumn(),
                getEnabledTableColumn(),
              ],
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              validate: !this.isldap,
              tooltip: this.isldap && this.$t('system.text_521'),
            }
          },
        },
        {
          label: this.$t('system.text_525'),
          permission: 'users_perform_leave',
          action: () => {
            this.createDialog('UserGroupLeaveDialog', {
              title: this.$t('system.text_525'),
              onManager: this.lionManagerst,
              data: this.list.selectedItems,
              resItem: this.data,
              columns: this.columns,
              refresh: this.refresh,
            })
          },
          meta: () => {
            if (this.list.selectedItems <= 0) {
              return {
                validate: false,
              }
            }
            return {
              validate: !this.isldap,
              tooltip: this.isldap && this.$t('system.text_521'),
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('system.text_525'),
          permission: 'users_perform_leave',
          action: (obj) => {
            this.createDialog('UserGroupLeaveDialog', {
              title: this.$t('system.text_525'),
              onManager: this.lionManagerst,
              data: [obj],
              resItem: this.data,
              columns: this.columns,
              refresh: this.refresh,
            })
          },
          meta: (obj) => {
            return {
              validate: !this.isldap,
              tooltip: this.isldap && this.$t('system.text_521'),
            }
          },
        },
      ],
    }
  },
  computed: {
    isldap () {
      return this.data.idp_driver === 'ldap'
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getList (params) {
      return new this.$Manager('groups', 'v1').list({
        params: params,
        ctx: [['users', this.data.id]],
      })
    },
  },
}
</script>
