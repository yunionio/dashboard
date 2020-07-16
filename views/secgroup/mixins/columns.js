import HighLight from '../components/HighLight'
import {
  getProjectTableColumn,
  getNameDescriptionTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'rules',
        title: '规则预览(策略，来源，协议，端口)',
        width: 220,
        type: 'expand',
        slots: {
          default: ({ row }) => {
            const len = (row.rules && row.rules.length) || 0
            return `${len}个`
          },
          content: ({ row }, h) => {
            const inList = []
            const outList = []
            if (row.rules && row.rules.length > 0) {
              row.rules.forEach(obj => {
                let text = ''
                if (obj.action) text += `${obj.action}`
                if (obj.cidr) text += `，${obj.cidr}`
                if (obj.protocol) text += `，${obj.protocol}`
                if (obj.ports) text += `，${obj.ports}`
                if (obj.direction === 'in') {
                  inList.push({
                    value: text,
                    rule: obj,
                  })
                } else if (obj.direction === 'out') {
                  outList.push({
                    value: text,
                    rule: obj,
                  })
                }
              })
            }
            const ret = []
            const keys = this.list.filter
            const getHightLight = (keys, item) => {
              if (keys.ip) {
                return <HighLight k={ keys['ip'] && keys['ip'][0] } v={ item.value } />
              } else if (keys.ports) {
                return <HighLight k={ keys['ports'] && keys['ports'][0] } v={ item.value } />
              } else {
                return <HighLight v={ item.value } />
              }
            }
            if (inList.length > 0) {
              ret.push(
                <div class='d-flex'>
                  <div class='flex-grow-0 flex-shrink-0'>入方向：</div>
                  <div>{ inList.map(item => {
                    return <span onClick={ () => { this.openEditRulesDialog(item.rule) } }>{ getHightLight(keys, item) }</span>
                  }) }</div>
                </div>
              )
            }
            if (outList.length > 0) {
              ret.push(
                <div class='mb-2 d-flex'>
                  <div class='flex-grow-0 flex-shrink-0'>出方向：</div>
                  <div>{ outList.map(item => {
                    return <span onClick={ () => { this.openEditRulesDialog(item.rule) } }>{ getHightLight(keys, item) }</span>
                  }) }</div>
                </div>
              )
            }
            if (ret.length <= 0) {
              ret.push(
                <div>暂无规则</div>
              )
            }
            return ret
          },
        },
      },
      {
        field: 'guest_cnt',
        title: '关联虚拟机',
        width: 80,
        slots: {
          default: ({ row }, h) => {
            return [
              <span class={{ 'link-color oc-pointer': true }} onClick={ () => this.openAssociateVirtualMachineDialog(row) }>{ row.guest_cnt }</span>,
            ]
          },
        },
      },
      getPublicScopeTableColumn({ vm: this, width: '180px' }),
      getProjectTableColumn(),
    ]
  },
}
