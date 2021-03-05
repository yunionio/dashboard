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
          label: this.$t('compute.text_260'),
          action: () => {
            this.unbind(this.list.selectedItems)
          },
          meta: (obj) => {
            return {
              buttonType: 'primary',
              validate: !!this.list.selectedItems.length,
              // tooltip,
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('compute.text_260'),
          action: (obj) => {
            this.unbind([obj])
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    unbind (data) {
      this.createDialog('AnsibleTemplateUnbindServerDialog', {
        data,
        resId: this.resId,
        columns: this.columns,
        title: this.$t('compute.perform_delete'),
        list: this.list,
      })
    },
  },
}
</script>
