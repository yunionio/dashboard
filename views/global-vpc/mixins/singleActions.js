import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      getDomainChangeOwnerAction(this, {
        name: this.$t('dictionary.globalvpc'),
        resource: 'globalvpcs',
      }),
      getSetPublicAction(this, {
        name: this.$t('dictionary.globalvpc'),
        scope: 'domain',
        resource: 'globalvpcs',
      }),
      {
        label: i18n.t('network.text_131'),
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            name: this.$t('dictionary.globalvpc'),
            title: i18n.t('network.text_131'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            // alert: '提示：请确保存储桶下所有目录和文件已删空，删除后数据不可恢复和访问。',
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
