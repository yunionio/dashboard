<template>
  <div>
    <a-tabs :defaultActiveKey="currentResource" @change="handleTabChange">
      <a-tab-pane
        v-for="item of resourceCounts"
        :tab="getTab(item)"
        :key="item.resource" />
    </a-tabs>
    <page-list
      :list="list"
      :columns="columns"
      :single-actions="singleActions" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { getStatusTableColumn, getBrandTableColumn, getNameDescriptionTableColumn, getProjectTableColumn } from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { getBrandItems, mapperStatusToItems } from '@/utils/common/tableFilter'

export default {
  name: 'BindResource',
  mixins: [WindowsMixin],
  props: {
    resId: {
      type: String,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    const resourceCounts = []
    R.forEachObjIndexed((value, key) => {
      if (key.endsWith('_count')) {
        resourceCounts.push({ resource: key.replace('_count', ''), count: value })
      }
    }, this.data)
    const currentResource = resourceCounts[0]['resource']
    return {
      resources: {
        disk: '硬盘',
        server: '主机',
        eip: 'EIP',
        snapshot: '快照',
        dbinstance: 'RDS',
      },
      resourceCounts,
      currentResource,
      list: {},
      singleActions: [
        {
          label: '解绑',
          action: obj => {
            this.createDialog('TagUnbindDialog', {
              columns: this.columns,
              data: [obj],
              list: this.list,
              tagData: this.data,
            })
          },
        },
      ],
    }
  },
  computed: {
    getParams () {
      const ret = {
        details: true,
        with_meta: true,
        'tags.0.key': this.data['key'],
      }
      if (this.data['value']) {
        ret['tags.0.value'] = this.data['value']
      }
      return ret
    },
    columns () {
      return [
        getNameDescriptionTableColumn({ addLock: true, vm: this }),
        getStatusTableColumn({ statusModule: this.currentResource }),
        getBrandTableColumn(),
        getProjectTableColumn(),
      ]
    },
  },
  watch: {
    currentResource: {
      handler (val) {
        this.list = this.$list.createList(this, {
          resource: `${val}s`,
          getParams: this.getParams,
          steadyStatus: Object.values(expectStatus[val]) && Object.values(expectStatus[val]).flat(),
          filterOptions: {
            name: {
              label: '名称',
              filter: true,
              formatter: val => {
                return `name.contains(${val})`
              },
            },
            brand: {
              label: '平台',
              dropdown: true,
              multiple: true,
              items: getBrandItems('brands'),
            },
            status: {
              label: '状态',
              dropdown: true,
              multiple: true,
              distinctField: {
                type: 'field',
                key: 'status',
              },
              mapper: data => {
                return mapperStatusToItems(data, `status.${val}`)
              },
              filter: true,
              formatter: val => {
                return `status.in(${val.join(',')})`
              },
            },
            tenant: {
              label: '项目',
              dropdown: true,
              multiple: true,
              distinctField: {
                type: 'extra_field',
                key: 'tenant',
              },
            },
          },
        })
        this.list.fetchData(0)
      },
      immediate: true,
    },
  },
  methods: {
    handleTabChange (val) {
      this.currentResource = val
    },
    getTab (item) {
      return `${this.resources[item.resource]}(${item.count})`
    },
  },
}
</script>
