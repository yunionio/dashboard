<template>
  <div>
    <page-header :title="$t('common_325')" />
    <page-body>
      <page-list
        :list="list"
        :columns="columns"
        :single-actions="singleActions"
        :export-data-options="exportDataOptions" />
    </page-body>
  </div>
</template>

<script>
// import * as R from 'ramda'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { getBrandTableColumn } from '@/utils/common/tableColumn'
// import { getBrandTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import { getNameFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'ClouduserForUser',
  mixins: [WindowsMixin, ListMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'ClouduserForUser',
        resource: 'cloudusers',
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
          label: this.$t('common_326'),
          action: (obj) => {
            this.createDialog('CloudgroupListForClouduserForUserDialog', {
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
        {
          field: 'password',
          title: this.$t('common_328'),
          width: 50,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='cloudusers' />]
            },
          },
        },
        getBrandTableColumn(),
        {
          field: 'iam_login_url',
          title: this.$t('common_329'),
          showOverflow: 'title',
          slots: {
            default: ({ row }) => {
              if (!row.iam_login_url) return '-'
              return [<help-link href={ row.iam_login_url } />]
            },
          },
        },
        {
          field: 'cloudgroups',
          title: this.$t('common_460', [this.$t('dictionary.cloudgroup')]),
          // type: 'expand',
          slots: {
            default: ({ row }) => {
              return this.$t('common_323', [(row.cloudgroups && row.cloudgroups.length) || 0])
            },
            // content: ({ row }) => {
            //   if (R.isNil(row.cloudgroups) || R.isEmpty(row.cloudgroups)) return this.$t('common_708', [this.$t('dictionary.cloudgroup')])
            //   return [
            //     <vxe-grid
            //       showOverflow='title'
            //       data={ row.cloudgroups }
            //       columns={[
            //         getNameDescriptionTableColumn({
            //           onManager: this.onManager,
            //           hideField: true,
            //           showDesc: false,
            //           edit: false,
            //           slotCallback: row => {
            //             return (
            //               <side-page-trigger permission='cloudgroup_get' name='CloudgroupSidePage' id={row.id} vm={this}>{ row.name }</side-page-trigger>
            //             )
            //           },
            //         }),
            //         {
            //           field: 'id',
            //           title: 'ID',
            //           formatter: ({ cellValue }) => cellValue || '-',
            //         },
            //       ]} />,
            //   ]
            // },
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
