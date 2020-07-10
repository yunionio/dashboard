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
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'CloudproviderList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
    data: {
      type: Object,
    },
    cloudaccountListRefresh: {
      type: Function,
    },
  },
  data () {
    const ownerDomain = list => this.$store.getters.isAdminMode || list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
    const isAccountDomain = data => data.share_mode === 'account_domain'
    return {
      list: this.$list.createList(this, {
        resource: 'cloudproviders',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.cloudaccount).flat(),
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('cloudproviderCreateDialog', {
              data: this.data,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: this.data.brand === 'Azure',
              tooltip: this.data.brand !== 'Azure' && '仅Azure平台支持此操作',
            }
          },
        },
        {
          label: '启用',
          action: () => {
            this.list.batchPerformAction('enable', null).then(() => {
              this.$bus.$emit('CloudAccountListSingleRefresh', [this.data.id])
            })
          },
          meta: () => {
            const isDisable = !!this.list.selectedItems.find(item => !item.enabled)
            return {
              validate: this.list.selectedItems.length && ownerDomain(this.list) && isDisable,
            }
          },
        },
        {
          label: '禁用',
          action: () => {
            this.list.batchPerformAction('disable', null).then(() => {
              this.$bus.$emit('CloudAccountListSingleRefresh', [this.data.id])
            })
          },
          meta: () => {
            const isEnable = !!this.list.selectedItems.find(item => item.enabled)
            return {
              validate: this.list.selectedItems.length && ownerDomain(this.list) && isEnable,
            }
          },
        },
        {
          label: `更改${this.$t('dictionary.project')}`,
          action: () => {
            if (isAccountDomain(this.data)) {
              this.createDialog('ChangeProjectDialog', {
                data: this.list.selectedItems,
                columns: this.columns,
                onManager: this.onManager,
                alertMessage: `更改${this.$t('dictionary.project')}时若同时修改${this.$t('dictionary.domain')}，该订阅所属${this.$t('dictionary.domain')}会同步修改`,
              })
            } else {
              this.createDialog('ChangeOwenrDialog', {
                data: this.list.selectedItems,
                columns: this.columns,
                onManager: this.onManager,
                action: 'change-project',
                resource: 'cloudproviders',
                alertMessage: `更改${this.$t('dictionary.project')}时若同时修改${this.$t('dictionary.domain')}，该订阅所属${this.$t('dictionary.domain')}会同步修改`,
              })
            }
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length && this.list.selectedItems.every(val => val.enabled) && ownerDomain(this.list),
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('cloudaccount-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CloudproviderSidePage', {
        id: row.id,
        resource: 'cloudproviders',
        getParams: this.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
