import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      // {
      //   label: '修改属性',
      //   action: (row) => {
      //     const { id } = row
      //     this.$router.push(`/ansibletemplate/create?id=${id}`)
      //   },
      // },
      ...getEnabledSwitchActions(this),
      {
        label: i18n.t('compute.text_232'),
        action: obj => {
          this.createDialog('AnsibleTemplateBindServerDialog', {
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.text_232'),
          })
        },
        meta: (obj) => ({
          validate: obj.enabled,
          tooltip: !obj.enabled ? i18n.t('compute.text_259') : '',
        }),
      },
      // {
      //   label: '更多',
      //   actions: (obj) => {
      //     return [
      //       {
      //         label: '启用',
      //         action: () => {
      //           this.onManager('update', {
      //             id: obj.id,
      //             managerArgs: {
      //               data: {
      //                 enabled: true,
      //               },
      //             },
      //           })
      //         },
      //         meta: () => ({
      //           validate: !obj.enabled,
      //           tooltip: obj.enabled ? '请选择已禁用的模版' : '',
      //         }),
      //       },
      //       {
      //         label: '禁用',
      //         action: () => {
      //           this.onManager('update', {
      //             id: obj.id,
      //             managerArgs: {
      //               data: {
      //                 enabled: false,
      //               },
      //             },
      //           })
      //         },
      //         meta: () => ({
      //           validate: obj.enabled,
      //           tooltip: !obj.enabled ? '请选择已启用的模版' : '',
      //         }),
      //       },
      //       {
      //         label: '关联主机',
      //         action: data => {
      //           this.createDialog('AnsibleTemplateBindServerDialog', {
      //             data: [data],
      //             columns: this.columns,
      //             title: '关联主机',
      //           })
      //         },
      //         meta: () => ({
      //           validate: obj.enabled,
      //           tooltip: !obj.enabled ? '请选择已启用的实例' : '',
      //         }),
      //       },
      //       {
      //         label: '删除',
      //         action: data => {
      //           this.createDialog('DeleteResDialog', {
      //             vm: this,
      //             data: [data],
      //             columns: this.columns,
      //             title: '关联主机',
      //             onManager: this.onManager,
      //           })
      //         },
      //         meta: () => ({
      //           validate: obj.can_delete,
      //         }),
      //       },
      //     ]
      //   },
      // },
    ]
  },
}
