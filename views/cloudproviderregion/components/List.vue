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
import expectStatus from '@/constants/expectStatus'

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
        steadyStatus: Object.values(expectStatus.cloudaccountSyncStatus).flat(),
        idKey: 'cloudregion_id',
        filterOptions: {
          cloudregion: {
            label: this.$t('cloudenv.text_95'),
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `cloudregions.id(cloudregion_id).name.contains('${val}')`
            },
          },
        },
        itemGet: (data, params) => {
          return this.$http.get(`/v2/cloudproviders/${data.cloudprovider_id}/cloudregions/${data.cloudregion_id}`, {
            params,
          })
        },
      }),
      groupActions: [
        {
          label: this.$t('cloudenv.text_363'),
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
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
