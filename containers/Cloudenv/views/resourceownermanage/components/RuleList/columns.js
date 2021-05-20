import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getProjectDomainTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  data () {
    return {
      normalColmns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          edit: (row) => {
            if (row.id === 'DIRECT') return false
            const { isDomainMode, userInfo } = this.$store.getters
            if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
              return false
            }
            return true
          },
          showDesc: (row) => {
            if (row.id === 'DIRECT') return false
            const { isDomainMode, userInfo } = this.$store.getters
            if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
              return false
            }
            return true
          },
          slotCallback: row => {
            return (
              <side-page-trigger name="ResourceOwnerManageSidePage" id={row.id} list={this.list} vm={this}>{ row.name } {row.id === 'DIRECT' && i18n.t('cloudenv.text_110')}</side-page-trigger>
            )
          },
        }),
        getCopyWithContentTableColumn({
          field: 'https_proxy',
          title: i18n.t('cloudenv.text_395'),
        }),
        getCopyWithContentTableColumn({
          field: 'http_proxy',
          title: i18n.t('cloudenv.text_398'),
        }),
        getCopyWithContentTableColumn({
          field: 'no_proxy',
          title: i18n.t('cloudenv.text_401'),
        }),
        getPublicScopeTableColumn({ vm: this, resource: 'proxysettings' }),
        getProjectDomainTableColumn({ sortable: false }),
      ],
      dragColumn: {
        width: 60,
        slots: {
          default: () => {
            return [
              <span class="drag-btn">
                <i class="vxe-icon--menu"></i>
              </span>,
            ]
          },
          header: () => {
            return [
              <vxe-tooltip v-model={ this.showHelpTip2 } content="按住后可以上下拖动排序！" enterable>
                <i class="vxe-icon--question" onClick={ () => { this.showHelpTip2 = !this.showHelpTip2 } }></i>
              </vxe-tooltip>,
            ]
          },
        },
      },
    }
  },
  created () {
  },
  computed: {
    columns: function () {
      if (this.canSort) {
        return [this.dragColumn, ...this.normalColmns]
      } else {
        return this.normalColmns
      }
    },
  },
}
