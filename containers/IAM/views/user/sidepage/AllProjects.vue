<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import RoleColumn from '../components/RoleColumn'

export default {
  name: 'UserSidepageAllProjects',
  mixins: [WindowsMixin],
  props: {
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
        getParams: { effective: true, resource: 'user' },
      }),
      columns: [
        getCopyWithContentTableColumn({
          title: this.$t('system.text_560'),
          field: 'name',
        }),
        {
          title: this.$t('dictionary.role'),
          field: 'role',
          slots: {
            default: ({ row }) => {
              return row.roles.map(item => item.name).join(', ')
            },
          },
        },
        {
          title: this.$t('dictionary.policy'),
          field: 'role',
          slots: {
            default: ({ row }) => {
              return [<RoleColumn vm={this} roles={row.roles || []} />]
            },
          },
        },
      ],
      groupActions: [
      ],
      singleActions: [
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.$bus.$on('UserSidepageAllProjectsListRefresh', () => {
      this.list.refresh()
    }, this)
  },
  methods: {
    getList (params) {
      return new this.$Manager('role_assignments', 'v1').objectRpc({
        methodname: 'GetProjectRole',
        objId: this.data.id,
        params,
      })
    },
  },
}
</script>
