// import HighLight from '../components/HighLight'
import {
  getProjectTableColumn,
  getNameDescriptionTableColumn,
  getPublicScopeTableColumn,
  getTagTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
  getRegionTableColumn,
  getCopyWithContentTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  props: {
    secgroupType: {
      type: String,
      validator (value) {
        return ['network', 'server'].includes(value)
      },
    },
  },
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: i18n.t('compute.text_210') },
        ],
        edit: this.secgroupType !== 'network',
        editDesc: this.secgroupType !== 'network',
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name || row.secgroup }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'secgroup', vm: this, field: this.secgroupType === 'network' ? 'secgroup_status' : 'status' }),
      getTagTableColumn({ onManager: this.onManager, resource: 'secgroups', columns: () => this.columns }),
      // {
      //   field: 'rules',
      //   title: i18n.t('compute.text_1025'),
      //   width: 220,
      //   type: 'expand',
      //   slots: {
      //     default: ({ row }) => {
      //       if (this.isPreLoad && !row.rules) return [<data-loading />]
      //       const len = (row.rules && row.rules.length) || 0
      //       return i18n.t('compute.text_619', [len])
      //     },
      //     content: ({ row }, h) => {
      //       const inList = []
      //       const outList = []
      //       if (row.rules && row.rules.length > 0) {
      //         row.rules.forEach(obj => {
      //           let text = ''
      //           if (obj.action) text += `${obj.action}`
      //           if (obj.cidr) text += ` ${obj.cidr} (IP)`
      //           if (obj.protocol) text += ` ${obj.protocol}`
      //           if (obj.ports) text += ` ${obj.ports}`
      //           if (obj.direction === 'in') {
      //             inList.push({
      //               value: text,
      //               rule: obj,
      //             })
      //           } else if (obj.direction === 'out') {
      //             outList.push({
      //               value: text,
      //               rule: obj,
      //             })
      //           }
      //         })
      //       }
      //       const ret = []
      //       const keys = this.list.filter
      //       const getHightLight = (keys, item) => {
      //         if (keys.ip) {
      //           return <HighLight k={ keys.ip && keys.ip[0] } v={ item.value } />
      //         } else if (keys.ports) {
      //           return <HighLight k={ keys.ports && keys.ports[0] } v={ item.value } />
      //         } else {
      //           return <HighLight v={ item.value } />
      //         }
      //       }
      //       if (inList.length > 0) {
      //         ret.push(
      //           <div class='d-flex'>
      //             <div class='flex-grow-0 flex-shrink-0'>{this.$t('compute.text_1316')}</div>
      //             <div>{ inList.map(item => {
      //               return <span onClick={ () => { this.openEditRulesDialog(item.rule, row) } }>{ getHightLight(keys, item) }</span>
      //             }) }</div>
      //           </div>,
      //         )
      //       }
      //       if (outList.length > 0) {
      //         ret.push(
      //           <div class='mb-2 d-flex'>
      //             <div class='flex-grow-0 flex-shrink-0'>{this.$t('compute.text_1317')}</div>
      //             <div>{ outList.map(item => {
      //               return <span onClick={ () => { this.openEditRulesDialog(item.rule, row) } }>{ getHightLight(keys, item) }</span>
      //             }) }</div>
      //           </div>,
      //         )
      //       }
      //       if (ret.length <= 0) {
      //         ret.push(
      //           <div>{this.$t('compute.norule')}</div>,
      //         )
      //       }
      //       return ret
      //     },
      //   },
      // },
      getBrandTableColumn(),
      getAccountTableColumn(),
      {
        field: 'guest_cnt',
        title: i18n.t('compute.associated_instances'),
        width: 80,
        slots: {
          default: ({ row }, h) => {
            if (row.guest_cnt === undefined && row.guest_nic_cnt === undefined) return [<data-loading />]
            return row.total_cnt || 0
          },
        },
        hidden: () => this.hiddenColumns.includes('guest_cnt'),
      },
      // {
      //   field: 'cache_cnt',
      //   title: this.$t('compute.cache_cnt'),
      //   slots: {
      //     default: ({ row }, h) => {
      //       if (row.cache_cnt === undefined) return [<data-loading />]
      //       return row.cache_cnt
      //     },
      //   },
      // },
      getPublicScopeTableColumn({ vm: this, resource: 'secgroups' }),
      getProjectTableColumn(),
      getRegionTableColumn(),
      getCopyWithContentTableColumn({
        field: 'vpc',
        title: 'VPC',
      }),
      getTimeTableColumn(),
    ]
  },
}
