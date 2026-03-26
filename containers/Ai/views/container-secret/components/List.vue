<template>
  <page-list
    show-tag-filter
    show-tag-columns
    show-tag-columns2
    show-tag-config
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :tag-config-params="tagConfigParams"
    tag-filter-resource="credentials" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

const credentialIdFilterFormatter = (val) => `id.equals('${val}')`

export default {
  name: 'ContainerSecretList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
    type: {
      type: String,
      default: 'container_secret',
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'credentials',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
            filter: true,
            formatter: credentialIdFilterFormatter,
          },
          name: getNameFilter(),
        },
        hiddenColumns: [],
      }),
      tagConfigParams: {
        resource: 'credentials',
      },
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.createDialog('ContainerSecretCreateDialog', {
              callback: () => {
                this.list.refresh()
              },
            })
          },
          meta: () => ({
            buttonType: 'primary',
            validate: true,
          }),
          hidden: this.type === 'container_image',
        },
        {
          label: this.$t('table.action.delete'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('table.action.delete'),
              name: this.$t('aice.container_secret'),
              onManager: this.onManager,
            })
          },
          meta: () => ({
            validate: this.list.selected.length,
          }),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('detail')
    const q = this.$route.query || {}
    if (this.type === 'container_image' && q.type === 'container_image' && q.id) {
      const idStr = String(Array.isArray(q.id) ? q.id[0] : q.id).trim()
      if (idStr) {
        this.list.changeFilter({
          id: [idStr],
          __condition_id: 'equals',
        })
      } else {
        this.list.fetchData()
      }
    } else {
      this.list.fetchData()
    }
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        'filter.0': `type.equals(${this.type})`,
      }
      if (this.$store.getters.scope === 'project') {
        const uid = this.$store.getters.userInfo?.id
        if (uid) ret['filter.1'] = `user_id.equals(${uid})`
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'ContainerSecretSidePage', {
        id: row.id,
        resource: 'credentials',
        apiVersion: 'v1',
        getParams: () => ({}),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
