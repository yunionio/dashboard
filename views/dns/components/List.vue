<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { REGEXP } from '@/utils/validate'

const { IPv4, domain } = REGEXP
const RECORD_TYPE_MAP = {
  A: 'A/AAAA',
  AAAA: 'A/AAAA',
  CNAME: 'CNAME',
  PTR: 'PTR',
  SRV: 'SRV',
}

const classify = (recordStr) => {
  let initArr = recordStr.split(',')
  const recordList = initArr.map(keyValue => {
    const arr = keyValue.split(':')
    const key = arr[0]
    if (key === 'SRV') {
      return {
        key,
        host: arr[1],
        port: arr[2],
        weight: arr[3],
        priority: arr[4],
      }
    } else {
      const record = keyValue
        .split(':')
        .slice(1)
        .join(':')
      return { key, record }
    }
  })
  const key = recordList[0].key // 拿第一个 key 做判断
  return {
    recordType: RECORD_TYPE_MAP[key],
    recordList,
  }
}

const checkName = (row) => {
  return (rule, value, callback) => {
    if (!value) {
      return callback(new Error('请输入域名'))
    }
    if (IPv4.regexp.test(value) || !domain.regexp.test(value)) {
      return callback(new Error('请输入合法域名'))
    }
    const { recordType } = classify(row.records)
    if (recordType === 'SRV') {
      let parts = value.split('.')
      if (parts.length < 3) {
        return callback(new Error('请输入合法的SRV域名'))
      }
      for (let i = 0; i < parts.length; i++) {
        if (i < 2 && (parts[i].length < 2 || parts[i][0] !== '_')) {
          return callback(new Error('请输入合法SRV域名'))
        } else if (i >= 2 && parts[i].length === 0) {
          return callback(new Error('请输入合法SRV域名'))
        }
      }
    }
    callback()
  }
}

export default {
  name: 'DNSList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'dnsrecords',
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
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          title: '域名',
          formRules: function (row) {
            return [
              { required: true, message: '请输入名字' },
              { validator: checkName(row) },
            ]
          },
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'DNSSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getCopyWithContentTableColumn({
          field: 'records',
          title: '记录值',
        }),
        {
          field: 'ttl',
          title: 'TTL',
          formatter: ({ cellValue, row }) => {
            const ttlTime = parseInt(cellValue / 60)
            if (ttlTime >= 1440) { // 一天是 1440 分钟
              return `${parseInt(ttlTime / 1440)} 天`
            } else if (ttlTime >= 60) {
              return `${parseInt(ttlTime / 60)} 小时`
            } else if (ttlTime > 1) {
              return `${ttlTime} 分钟`
            } else {
              return `${cellValue || 0} 秒`
            }
          },
        },
        getEnabledTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('DnsCreateDialog', {
              title: '新建',
              data: this.list.selectedItems,
              list: this.list,
              type: 'create',
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          permission: 'vpcs_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '启用',
          action: (obj) => {
            this.list.onManager('performAction', {
              id: obj.id,
              managerArgs: {
                action: 'enable',
              },
            })
          },
          meta: (obj) => ({
            validate: !obj.enabled,
          }),
        },
        {
          label: '禁用',
          action: (obj) => {
            this.list.onManager('performAction', {
              id: obj.id,
              managerArgs: {
                action: 'disable',
              },
            })
          },
          meta: (obj) => ({
            validate: obj.enabled,
          }),
        },
        {
          label: '更多',
          actions: obj => {
            return [
              {
                label: '修改',
                action: () => {
                  this.createDialog('DnsCreateDialog', {
                    title: '修改',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                    type: 'update',
                  })
                },
                meta: (obj) => ({
                  validate: obj.can_update,
                }),
              },
              {
                label: '克隆',
                action: () => {
                  this.createDialog('DnsCreateDialog', {
                    title: '克隆',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                    type: 'clone',
                  })
                },
              },
              {
                label: '删除',
                permission: 'dnsrecords_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    title: '删除',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                    success: () => {
                      this.destroySidePages()
                    },
                  })
                },
                meta: () => this.$getDeleteResult(obj),
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('dns-detail')
    this.list.fetchData()
  },
}
</script>
