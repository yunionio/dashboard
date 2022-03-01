<template>
  <page-list
    id="role-sidepage-role-policies-list"
    :list="list"
    :columns="tableColumns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    default-search-key="policy_id" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import {
  getCopyWithContentTableColumn,
  getNameDescriptionTableColumn,
  getTimeRangeColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'PoliciesListForRoleSidepage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    resId: {
      type: String,
      required: true,
    },
    columns: Array,
    data: Object,
    singleRefreshRole: Function,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'rolepolicies',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          policy_id: {
            label: this.$t('system.text_101'),
          },
        },
      }),
      tableColumns: [
        getNameDescriptionTableColumn({
          resource: 'policies',
          hideField: true,
          showDesc: false,
          edit: false,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.policy }</side-page-trigger>
            )
          },
        }),
        {
          field: 'description',
          title: this.$t('table.title.desc'),
          minWidth: 200,
        },
        getCopyWithContentTableColumn({
          field: 'ips',
          title: this.$t('system.text_328'),
        }),
        getCopyWithContentTableColumn({
          field: 'project',
          title: this.$t('res.project'),
        }),
        getTimeRangeColumn({
          start_field: 'valid_since',
          end_field: 'valid_until',
          title: this.$t('iam.role_policy_valid_time_range'),
          format: 'YYYY-MM-DD hh:mm',
        }),
      ],
      groupActions: [
        {
          label: this.$t('role.action.add_policies'),
          permission: 'roles_perform_set_policies',
          action: () => {
            this.createDialog('RoleSetPoliciesDialog', {
              data: [this.data],
              setPoliciesAction: 'update',
              columns: this.columns,
              success: () => {
                this.refresh()
                this.singleRefreshRole(this.resId)
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
          label: this.$t('common.remove'),
          permission: 'rolepolicies_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.tableColumns,
              title: this.$t('common.remove'),
              name: this.$t('res.policy'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
      singleActions: [
        {
          label: this.$t('common.remove'),
          permission: 'rolepolicies_delete',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.tableColumns,
              title: this.$t('common.remove'),
              name: this.$t('res.policy'),
              onManager: this.onManager,
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        filter: `role_id.in("${this.resId}")`,
      }
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'PolicySidePage', {
        id: row.policy_id,
        resource: 'policies',
        apiVersion: 'v1',
        getParams: this.getParam,
      })
    },
  },
}
</script>
