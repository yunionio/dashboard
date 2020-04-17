<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'CloudproviderregionList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
    cloudproviderId: {
      type: String,
      required: true,
    },
  },
  data () {
    // const ownerDomain = list => this.$store.getters.isAdminMode || this.list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
    return {
      list: this.$list.createList(this, {
        resource: 'cloudproviderregions',
        getParams: this.getParams,
        idKey: 'cloudregion_id',
        filterOptions: {
          joint_filter: {
            label: '名称',
            jointFilter: true,
            formatter: val => {
              return `cloudregions.id(cloudregion_id).name.contains('${val}')`
            },
          },
        },
      }),
      groupActions: [
        {
          label: '设置同步',
          action: () => {
            this.createDialog('cloudproviderregionsSetAutoSyncDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              refresh: this.refresh,
              cloudproviderId: this.cloudproviderId,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        },
      ],
<<<<<<< HEAD
=======
      singleActions: [
        {
          label: '设置同步',
          action: obj => {
            this.createDialog('cloudproviderregionsSetAutoSyncDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
              cloudproviderId: this.cloudproviderId,
            })
          },
          // meta: obj => {
          //   return {
          //     validate: ownerDomain(this.list),
          //   }
          // },
        },
      ],
>>>>>>> 35e3f8d65500ac068d864aba5ed2386327527f70
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
