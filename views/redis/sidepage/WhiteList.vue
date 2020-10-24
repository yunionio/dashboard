<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import { getStatusTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'

export default {
  name: 'RedisWhiteList',
  mixins: [WindowsMixin],
  props: {
    params: {
      type: Object,
    },
    data: {
      type: Object,
    },
  },
  data () {
    const steadyStatus = Object.values(expectStatus.redisACL).flat()
    return {
      steadyStatus,
      list: this.$list.createList(this, {
        resource: 'elasticcacheacls',
        getParams: this.params,
        steadyStatus,
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('redisACL'),
        },
      }),
      columns: [
        getCopyWithContentTableColumn(),
        getStatusTableColumn({ statusModule: 'redisACL' }),
        {
          field: 'ip',
          title: 'IP',
          slots: {
            default: ({ row }) => {
              if (row.ip_list) {
                const ips = row.ip_list.split(',')
                return ips.map(ip => {
                  return <div><a-tag>{ip}</a-tag></div>
                })
              }
              return ''
            },
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('db.text_41'),
          permission: 'redis_elasticcacheacls_create',
          action: (obj) => {
            this.createDialog('RedisWhiteListFormDialog', {
              title: this.$t('db.text_41'),
              list: this.list,
              redisItem: this.data,
              allIPList: this.allIPList,
            })
          },
          meta: () => {
            const isHuawei = this.data.brand === 'Huawei'
            let tooltip = ''
            if (isHuawei) {
              tooltip = this.$t('db.text_321')
            } else if (this.list.total >= 4) {
              tooltip = this.$t('db.text_327')
            }
            if (this.data.brand === 'Qcloud') {
              tooltip = this.$t('db.text_355')
            }
            return {
              buttonType: 'primary',
              validate: !tooltip,
              tooltip: tooltip,
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('db.text_328'),
          action: (obj) => {
            this.createDialog('RedisWhiteListFormDialog', {
              title: this.$t('db.text_328'),
              steadyStatus: this.steadyStatus,
              initialValues: {
                name: obj.name,
                ip_list: obj.ip_list,
              },
              allIPList: this.allIPList,
              data: [obj],
              list: this.list,
              columns: this.columns,
              redisItem: this.data,
            })
          },
          meta: () => {
            const isHuawei = this.data.brand === 'Huawei'
            return {
              validate: !isHuawei,
              tooltip: isHuawei ? this.$t('db.text_202') : null,
            }
          },
        },
        {
          label: this.$t('db.text_42'),
          permission: 'redis_elasticcacheacls_delete',
          action: (obj) => {
            this.createDialog('RedisWhiteListDeleteDialog', {
              data: [obj],
              columns: this.columns,
              title: this.$t('db.text_314'),
              list: this.list,
            })
          },
          meta: (obj) => {
            let tooltip = ''
            if (obj.name === 'default') {
              tooltip = this.$t('db.text_329')
            }
            return {
              validate: !tooltip,
              tooltip,
            }
          },
        },
      ],
    }
  },
  computed: {
    allIPList () {
      if (this.list && !R.isEmpty(this.list.data)) {
        let ipList = []
        Object.values(this.list.data).forEach(({ data }) => {
          if (data.ip_list && R.type(data.ip_list) === 'String' && !R.isEmpty(data.ip_list)) {
            ipList = [...ipList, ...data.ip_list.split(',')]
          }
        })
        return ipList
      }
      return []
    },
  },
  created () {
    this.list.fetchData()
  },
}
</script>
