<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AnsibleTemplateServerList',
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: [Object, Function],
    },
    data: {
      type: Object,
    },
    resId: {
      type: String,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'devtool_cronjobs',
        getParams: this.getParams,
        // steadyStatus: Object.values(expectStatus.redisAccount).flat(),
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          isNameEdit: false,
          showDesc: false,
          slotCallback: row => {
            return row.name
          },
        }),
      ],
      groupActions: [
        {
          label: '取消关联',
          action: () => {
<<<<<<< HEAD
            this.unbind(this.list.selectedItems)
=======
>>>>>>> 新增运维工具ansible（模版列表，任务列表）
          },
          meta: (obj) => {
            return {
              buttonType: 'primary',
<<<<<<< HEAD
              validate: !!this.list.selectedItems.length,
              // tooltip,
=======
>>>>>>> 新增运维工具ansible（模版列表，任务列表）
            }
          },
        },
      ],
      singleActions: [
        {
          label: '取消关联',
          action: (obj) => {
<<<<<<< HEAD
            this.unbind([obj])
=======
            this.createDialog('AnsibleTemplateUnbindServerDialog', {
              resId: this.resId,
              data: [obj],
              columns: this.columns,
              title: '取消关联',
              list: this.list,
            })
>>>>>>> 新增运维工具ansible（模版列表，任务列表）
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
<<<<<<< HEAD
  methods: {
    unbind (data) {
      this.createDialog('AnsibleTemplateUnbindServerDialog', {
        data,
        resId: this.resId,
        columns: this.columns,
        title: '取消关联',
        list: this.list,
      })
    },
  },
=======
>>>>>>> 新增运维工具ansible（模版列表，任务列表）
}
</script>
