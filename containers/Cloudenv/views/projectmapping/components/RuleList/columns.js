import i18n from '@/locales'
import { getTagColor, getTagTitle } from '@/utils/common/tag'
import Actions from '@/components/PageList/Actions'

const getResourceRuleTableColumn = ({
  field = 'name',
  title = i18n.t('cloudenv.text_582'),
} = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        const tags = row.tags.map(item => {
          const rgb = getTagColor(item.key, item.value, 'rgb')
          const strRgb = rgb.join(',')
          return (<span
            class="tag mb-1 text-truncate d-inline-block"
            title={getTagTitle(item.key, item.value)}
            key={`${item.key}${item.value}`}
            style={{ backgroundColor: `rgba(${strRgb},.1)`, boxSizing: 'border-box', color: `rgb(${strRgb})`, border: `solid 1px rgb(${strRgb})`, padding: '0 5px', marginRight: '10px' }}>
            { getTagTitle('user:' + item.key, item.value) }
          </span>)
        })
        return [<div>{ row.condition === 'and' ? i18n.t('cloudenv.text_588') : i18n.t('cloudenv.text_587') }</div>, <div>{ ...tags }</div>]
      },
      header: ({ column }, h) => {
        return [<span>{title}</span>]
      },
    },
  }
}
export default {
  data () {
    return {
      checkColumn: {
        type: 'checkbox',
        width: 40,
        showHeaderOverflow: false,
        resizable: false,
      },
      normalColmns: [
        getResourceRuleTableColumn(),
        {
          title: i18n.t('cloudenv.text_584'),
          field: 'accounts',
          slots: {
            default: ({ row }, h) => {
              return [
                <span class="text-color-secondary">{ row.project || '-'}</span>]
            },
          },
        },
        {
          field: '_action',
          title: this.$t('table.title._action'),
          minWidth: 120,
          resizable: false,
          slots: {
            default: ({ row }, h) => {
              return [
                this.$createElement(Actions, {
                  props: {
                    options: this.singleActions,
                    row,
                    buttonType: 'link',
                    buttonSize: 'small',
                    buttonStyle: {
                      fontSize: '12px',
                    },
                  },
                }),
              ]
            },
            header: ({ column }, h) => {
              return [
                this.$createElement('span', {
                  style: {
                    paddingLeft: '7px',
                  },
                }, this.$t('table.title._action')),
              ]
            },
          },
        },
      ],
      dragColumn: {
        width: 1,
        slots: {
          default: () => {
            return [
              <span v-show={this.canSort} class="drag-btn">
                <i class="vxe-icon--menu"></i>
              </span>,
            ]
          },
          header: () => {
            return [
              <vxe-tooltip v-show={this.canSort} v-model={this.showHelpTip2} content={i18n.t('cloudenv.text_591')} enterable>
                <i class="vxe-icon--question" onClick={ () => { this.showHelpTip2 = !this.showHelpTip2 } }></i>
              </vxe-tooltip>,
            ]
          },
        },
      },
    }
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_593'),
        permission: 'proxysettings_update',
        action: (row) => {
          this.createDialog('ProjectMappingRuleUpdateDialog', {
            id: this.data.id,
            rules: this.data.rules || [],
            data: [row],
            columns: this.columns,
            title: i18n.t('cloudenv.text_598'),
            success: (res) => {
              this.$bus.$emit('ProjectMappingRuleUpdate', res)
            },
          })
        },
        meta: () => {
          const ret = {
            validate: true,
          }
          if (!(this.isAdminMode || this.data.domain_id === this.userInfo.projectDomainId)) {
            ret.validate = false
            ret.tooltip = this.$t('cloudenv.text_597')
          }
          return ret
        },
      },
      {
        label: i18n.t('cloudenv.text_108'),
        permission: 'projectmappings_delete',
        action: (row) => {
          this.checkedRecords = [row]
          this.deleteProjectMappingRules()
        },
        meta: () => {
          const ret = {
            validate: true,
          }
          if (!(this.isAdminMode || this.data.domain_id === this.userInfo.projectDomainId)) {
            ret.validate = false
            ret.tooltip = this.$t('cloudenv.text_597')
          }
          return ret
        },
      },
    ]
  },
  computed: {
    columns: function () {
      if (this.canSort) {
        this.dragColumn.width = 60
      } else {
        this.dragColumn.width = 1
      }
      return [this.checkColumn, this.dragColumn, ...this.normalColmns]
    },
  },
}
