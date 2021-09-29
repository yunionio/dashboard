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
import { getNameFilter } from '@/utils/common/tableFilter'

export default {
  name: 'AlertRecordShieldsList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    listId: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        idKey: 'id',
        resource: 'alertrecordshields',
        apiVersion: 'v1',
        filterOptions: {
          name: getNameFilter({ label: this.$t('monitor.text_99') }),
          res_name: {
            field: 'res_name',
            label: this.$t('common_151'),
          },
        },
      }),
      groupActions: [
        {
          label: this.$t('monitor.alerts.shield.dismiss'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('monitor.alerts.shield.dismiss'),
              name: this.$t('dictionary.monitorresourcealerts'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      try {
        await this.list.fetchData()
      } catch (error) {
        throw error
      }
    },
  },
}
</script>

<style scoped>

</style>
