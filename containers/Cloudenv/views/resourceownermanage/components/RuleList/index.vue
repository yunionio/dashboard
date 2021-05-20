<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from './columns'
import SingleActionsMixin from './singleActions'
import { getNameFilter, getDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'ResourceOwnerManageList',
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
            this.createDialog('ResourceOwnerManageCreateDialog', {
              onManager: this.onManager,
              refresh: this.refresh,
            })
            console.log(this.list.data)
            // const newList = this.list.data.sort((a, b) => {
            //   return a.index - b.index
            // })
            // console.log(newList)
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '排序',
          permission: 'proxysettings_create',
          action: () => {
            this.canSort = true
          },
          meta: () => {
            return {
              validate: !this.canSort,
            }
          },
        },
        {
          label: this.$t('cloudenv.text_108'),
          permission: 'cloudaccounts_delete',
          action: () => {
            const supportBillBrands = ['Aws', 'Aliyun', 'Google', 'Huawei', 'Azure', 'Qcloud']
            const supportBill = this.list.selectedItems.some(item => {
              return supportBillBrands.includes(item.brand)
            })
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('cloudenv.text_109'),
              name: this.$t('dictionary.cloudaccount'),
              onManager: this.onManager,
              content: () => {
                if (supportBill) {
                  return <a-checkbox v-model={ this.batchDeleteBill }>{ this.$t('cloudenv.text_497') }</a-checkbox>
                }
                return null
              },
              success: async () => {
                if (supportBill && this.batchDeleteBill) {
                  const manager = new this.$Manager('bill_tasks', 'v1')
                  try {
                    const p = this.list.selectedItems.filter(item => {
                      return supportBillBrands.includes(item.brand)
                    }).map(item => {
                      return manager.create({
                        data: {
                          task_type: 'bill_remove',
                          cloudaccount_id: item.id,
                        },
                      })
                    })
                    await Promise.all(p)
                  } catch (err) {
                    throw err
                  }
                }
                this.batchDeleteBill = true
              },
              cancel: () => {
                this.batchDeleteBill = true
              },
            })
          },
          meta: () => {
            const deleteResult = this.$getDeleteResult(this.list.selectedItems)
            if (!deleteResult.validate) {
              return deleteResult
            }
            return {
              validate: true,
            }
          },
        },
      ],
      canSort: false,
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
