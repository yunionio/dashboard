<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">已加入权限组</div>
    <div slot="body">
      <page-list
        :list="list"
        :columns="columns"
        :expand-config="{ lazy: true, loadMethod: loadPolicy, visibleMethod: visbleLoadPolicy }" />
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
              if (R.isNil(row.feCloudpolicies) || R.isEmpty(row.feCloudpolicies)) return '无关联权限'
              return [
                <vxe-grid
                  showOverflow='title'
                  data={ row.feCloudpolicies }
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
  methods: {
    async loadPolicy ({ row }) {
      let manager = new this.$Manager('cloudpolicies', 'v1')
      try {
        const response = await manager.list({
          params: {
            cloudgroup_id: row.id,
            scope: this.$store.getters.scope,
          },
        })
        row.feCloudpolicies = response.data.data || []
        return response
      } catch (error) {
        throw error
      } finally {
        manager = null
      }
    },
    visbleLoadPolicy ({ row }) {
      return row.cloudpolicies && row.cloudpolicies.length > 0
    },
  },
}
</script>
