<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">已加入权限组</div>
    <div slot="body">
      <page-list
        :list="list"
        :columns="columns" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudgroupListForClouduserForUserDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'CloudgroupListForClouduserForUser',
        resource: 'cloudgroups',
        apiVersion: 'v1',
        getParams: {
          clouduser_id: this.params.data[0].id,
        },
      }),
      columns: [
        {
          field: 'name',
          title: this.$t('dictionary.cloudgroup'),
        },
        {
          field: 'cloudpolicies',
          title: '权限',
          type: 'expand',
          slots: {
            default: ({ row }) => {
              return [`${(row.cloudpolicies && row.cloudpolicies.length) || 0}个`]
            },
            content: ({ row }) => {
              if (R.isNil(row.cloudpolicies) || R.isEmpty(row.cloudpolicies)) return '无关联权限'
              return [
                <vxe-grid
                  showOverflow='title'
                  data={ row.cloudpolicies }
                  columns={[
                    {
                      field: 'name',
                      title: this.$t('common.name'),
                    },
                    {
                      field: 'description',
                      title: this.$t('table.column.title.desc'),
                      formatter: ({ cellValue }) => cellValue || '-',
                    },
                  ]} />,
              ]
            },
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
