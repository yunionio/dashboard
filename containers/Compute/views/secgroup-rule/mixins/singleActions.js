export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('compute.text_982'),
        permission: 'secgrouprules_update',
        action: obj => {
          this.createDialog('EditRulesDialog', {
            data: [obj],
            title: 'edit',
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
            type: this.type,
            brand: this.data.brand,
          })
        },
        meta: (obj) => {
          const ret = {
            validate: !this.isRead,
            tooltip: this.isRead ? this.$t('compute.secgroup.shared') : '',
          }
          if (['hcs', 'hcso', 'huawei', 'volcengine'].includes((this.data.brand || '').toLowerCase())) {
            ret.validate = false
            ret.tooltip = this.$t('compute.text_1388')
          }
          return ret
        },
      },
      // {
      //   label: this.$t('compute.text_983'),
      //   permission: 'secgrouprules_create',
      //   action: obj => {
      //     this.createDialog('EditRulesDialog', {
      //       data: [obj],
      //       title: 'clone',
      //       columns: this.columns,
      //       onManager: this.onManager,
      //       refresh: this.refresh,
      //       type: this.type,
      //       secgroup: this.id,
      //     })
      //   },
      //   meta: () => {
      //     return {
      //       validate: !this.isRead,
      //       tooltip: this.isRead ? i18n.t('compute.secgroup.shared') : '',
      //     }
      //   },
      // },
      {
        label: this.$t('compute.perform_delete'),
        permission: 'secgrouprules_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('compute.perform_delete'),
            name: this.$t('compute.text_984'),
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: () => {
          return {
            validate: !this.isRead,
            tooltip: this.isRead ? this.$t('compute.secgroup.shared') : '',
          }
        },
      },
    ]
  },
}
