
export default {
  computed: {
    commonMeta () {
      const rdsItem = this.params.rdsItem || this.data
      const isRunning = rdsItem.status === 'running'
      const isHuawei = rdsItem.brand === 'Huawei'
      const isAliyun = rdsItem.brand === 'Aliyun'
      const isGoogle = rdsItem.brand === 'Google'
      let tooltip = ''
      if (!isRunning) {
        tooltip = '仅在RDS实例运行中状态下支持新建操作'
      }
      return {
        isRunning,
        isHuawei,
        isAliyun,
        isGoogle,
        tooltip,
        validate: isRunning,
      }
    },
  },
  created () {
    this.singleActions = [
      {
        label: '重置密码',
        action: (obj) => {
          this.createDialog('RedisAccountLisResetPwdDialog', {
            data: [obj],
            list: this.list,
            columns: this.columns,
          })
        },
        meta: () => {
          if (this.commonMeta.isHuawei) {
            return {
              validate: false,
              tooltip: '华为云不支持此操作',
            }
          }
          return this.commonMeta
        },
      },
      {
        label: '修改权限',
        action: (obj) => {
          this.createDialog('RDSAccountUpdatePrivilegeDialog', {
            title: '修改权限',
            initialValues: {
              account_privilege: obj.account_privilege,
            },
            data: [obj],
            list: this.list,
            columns: this.columns,
            rdsItem: this.data,
          })
        },
        meta: (obj) => {
          const { isHuawei, isGoogle } = this.commonMeta
          if (isHuawei && obj.name === 'root') {
            return {
              validate: false,
              tooltip: '华为云主账号不支持此操作',
            }
          }
          if (isGoogle) {
            return {
              validate: false,
              tooltip: '谷歌云不支持此操作',
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: '删除',
        action: (obj) => {
          this.createDialog('RedisWhiteListDeleteDialog', {
            data: [obj],
            columns: this.columns,
            title: '删除账号',
            list: this.list,
          })
        },
        meta: (obj) => {
          const { tooltip, isAliyun } = this.commonMeta
          return {
            validate: obj.name !== 'root' || (!tooltip && isAliyun),
            tooltip,
          }
        },
      },
    ]
  },
}
