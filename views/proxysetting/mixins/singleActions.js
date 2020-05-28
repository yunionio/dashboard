import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: '修改属性',
        permission: 'proxysettings_update',
        action: (row) => {
          this.createDialog('ProxysettingUpdateDialog', {
            data: [row],
            columns: this.columns,
            title: '修改属性',
            onManager: this.onManager,
          })
        },
        meta: this.commonMeta,
      },
      getSetPublicAction(this, {
        name: this.$t('dictionary.proxysetting'),
        scope: 'domain',
        resource: 'proxysettings',
      }, {
        meta: this.commonMeta,
      }),
      {
        label: '删除',
        permission: 'proxysettings_delete',
        action: (row) => {
          this.createDialog('DeleteResDialog', {
            data: [row],
            columns: this.columns,
            title: '删除',
            name: this.$t('dictionary.proxysetting'),
            onManager: this.onManager,
          })
        },
        meta: (row) => this.commonMeta(row, 'delete'),
      },
    ]
  },
  methods: {
    commonMeta (row = {}, action) {
      const { id } = row
      const isDirect = id === 'DIRECT'
      if (!row.can_delete && action === 'delete') {
        return {
          validate: false,
          tooltip: '已关联云账号，请取消关联云账号后重试',
        }
      }
      if (isDirect) {
        return {
          validate: false,
          tooltip: '直接代理不支持此操作',
        }
      }
      const { isDomainMode, userInfo } = this.$store.getters
      if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
        return {
          validate: false,
          tooltip: '他人共享代理不支持该操作',
        }
      }
      return {
        isDirect,
        validate: true,
      }
    },
  },
}
