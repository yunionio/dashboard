<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter, getDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'ProxysettingList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'proxysettings',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
          project_domains: getDomainFilter(),
          // https_proxy: {
          //   label: 'https代理',
          // },
          // http_proxy: {
          //   label: 'http代理',
          // },
          // no_proxy: {
          //   label: '不走代理地址',
          // },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('cloudenv.text_395'), key: 'https_proxy' },
          { label: this.$t('cloudenv.text_398'), key: 'http_proxy' },
          { label: this.$t('cloudenv.text_403'), key: 'no_proxy' },
          {
            label: this.$t('compute.text_505'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('cloudaccounts'))
            },
          },
        ],
      },
      groupActions: [
        {
          label: this.$t('cloudenv.text_104'),
          permission: 'proxysettings_create',
          action: () => {
            this.createDialog('ProxysettingCreateDialog', {
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        getSetPublicAction(this, {
          name: this.$t('dictionary.proxysetting'),
          scope: 'domain',
          resource: 'proxysettings',
        }, {
          meta: () => {
            const lent = this.list.selectedItems.length
            if (lent === 0) {
              return {
                validate: false,
              }
            }
            for (let i = 0; i < lent; i++) {
              const row = this.list.selectedItems[i]
              if (row.id === 'DIRECT') {
                return {
                  tooltip: this.$t('cloudenv.text_404'),
                  validate: false,
                }
              }
              const { isDomainMode, userInfo } = this.$store.getters
              if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
                return {
                  validate: false,
                  tooltip: this.$t('cloudenv.text_405'),
                }
              }
            }
            return {
              validate: true,
            }
          },
        }),
        {
          label: this.$t('cloudenv.text_108'),
          permission: 'proxysettings_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('cloudenv.text_108'),
              name: this.$t('dictionary.proxysetting'),
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
    this.list.fetchData()
  },
}
</script>
