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
        tooltip = this.$t('db.text_198')
      }
      if (!isRunning) {
        tooltip = this.$t('db.text_198')
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
        label: this.$t('db.text_201'),
        action: (obj) => {
          this.createDialog('RedisAccountLisResetPwdDialog', {
            data: [obj],
            name: this.$t('dictionary.dbinstances'),
            list: this.list,
            columns: this.columns,
          })
        },
        meta: () => {
          if (this.commonMeta.isHuawei) {
            return {
              validate: false,
              tooltip: this.$t('db.text_202'),
            }
          }
          return this.commonMeta
        },
      },
      {
        label: this.$t('db.text_203'),
        action: (obj) => {
          this.createDialog('RDSAccountUpdatePrivilegeDialog', {
            title: this.$t('db.text_203'),
            initialValues: {
              account_privilege: obj.account_privilege,
              host: obj.host,
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
              tooltip: this.$t('db.text_204'),
            }
          }
          if (isGoogle) {
            return {
              validate: false,
              tooltip: this.$t('db.text_205'),
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: this.$t('db.text_42'),
        permission: 'rds_dbinstanceaccounts_delete',
        action: (obj) => {
          this.createDialog('RedisWhiteListDeleteDialog', {
            data: [obj],
            columns: this.columns,
            title: this.$t('db.text_206'),
            list: this.list,
          })
        },
        meta: (obj) => {
          const { tooltip, isAliyun } = this.commonMeta
          return {
            validate: obj.name !== 'root' || (!tooltip && isAliyun),
            tooltip: obj.name === 'root' ? this.$t('db.text_350') : tooltip,
          }
        },
      },
    ]
  },
}
