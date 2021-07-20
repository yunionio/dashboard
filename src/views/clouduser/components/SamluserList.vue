<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
// import * as R from 'ramda'
import { getBrandTableColumn } from '@/utils/common/tableColumn'
// import { getBrandTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import { getNameFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { HYPERVISORS_MAP } from '@/constants'
import SamlMixin from '../mixin'

export default {
  name: 'SamluserListForUser',
  mixins: [WindowsMixin, ListMixin, SamlMixin],
  data () {
    const isAzure = (provider = '') => { return provider.toLowerCase() === HYPERVISORS_MAP.azure.key }
    return {
      list: this.$list.createList(this, {
        id: 'SamluserForUser',
        resource: 'samlusers',
        apiVersion: 'v1',
        getParams: {
          user: this.$store.getters.userInfo.id,
        },
        filterOptions: {
          name: getNameFilter(),
          provider: getBrandFilter('cloud_id_brands'),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.name'), key: 'name' },
          { label: this.$t('table.title.brand'), key: 'brand' },
        ],
      },
      singleActions: [
        {
          label: this.$t('table.action.smal_login'),
          action: (obj) => {
            if (isAzure(obj.provider)) {
              this.createDialog('SamlLoginForAzureDialog', {
                data: [obj],
              })
            } else {
              this.samlLogin(obj)
            }
          },
        },
        {
          label: this.$t('common_326'),
          action: (obj) => {
            this.createDialog('CloudpoliciesListForClouduserForUserDialog', {
              data: [obj],
            })
          },
        },
      ],
      columns: [
        {
          field: 'name',
          title: this.$t('common_327'),
          showOverflow: 'title',
        },
        getBrandTableColumn(),
        {
          field: 'cloudgroups',
          title: this.$t('common_624', [this.$t('dictionary.cloudgroup')]),
          slots: {
            default: ({ row }) => {
              return row.cloudgroup
            },
          },
        },
        {
          field: 'cloudaccount',
          title: this.$t('common_295'),
          showOverflow: 'title',
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
