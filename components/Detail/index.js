import './style.scss'
import * as R from 'ramda'
import _ from 'lodash'
import moment from 'moment'
import classNames from 'classnames'

// 需要添加区域（cloudregion/cloudregion_id), 可用区（zone/zone_id)，云账号(account/account_id)，云订阅（manager/manager_id)的资源
const appendOutherResources = ['servers', 'hosts', 'disks', 'storages', 'vpcs', 'wires', 'networks', 'snapshots']

const getDefaultLastBaseInfo = (h, { data, list }) => {
  const outher = [
    {
      field: 'cloudregion',
      title: '区域',
      slots: {
        default: ({ row }) => {
          return [
            <div class='text-truncate'>
              <list-body-cell-wrap copy row={ data } list={ list } field='cloudregion' title={ row['cloudregion'] } />
              <list-body-cell-wrap copy row={ data } list={ list } field='cloudregion_id' title={ row['cloudregion_id'] } />
            </div>,
          ]
        },
      },
    },
    {
      field: 'zone',
      title: '可用区',
      slots: {
        default: ({ row }) => {
          return [
            <div class='text-truncate'>
              <list-body-cell-wrap copy row={ data } list={ list } field='zone' title={ row['zone'] } />
              <list-body-cell-wrap copy row={ data } list={ list } field='zone_id' title={ row['zone_id'] } />
            </div>,
          ]
        },
      },
    },
    {
      field: 'account',
      title: '云账号',
      slots: {
        default: ({ row }) => {
          return [
            <div class='text-truncate'>
              <list-body-cell-wrap copy row={ data } list={ list } field='account' title={ row['account'] } />
              <list-body-cell-wrap copy row={ data } list={ list } field='account_id' title={ row['account_id'] } />
            </div>,
          ]
        },
      },
    },
  ]
  let ret = [
    {
      field: 'created_at',
      title: '创建时间',
      formatter: ({ row }) => {
        return (row.created_at && moment(row.created_at).format()) || '-'
      },
    },
    {
      field: 'updated_at',
      title: '更新时间',
      formatter: ({ row }) => {
        return (row.updated_at && moment(row.updated_at).format()) || '-'
      },
    },
  ]
  if (appendOutherResources.includes(list.resource)) {
    ret = R.insertAll(0, outher, ret)
  }
  return ret
}

const getDefaultTopBaseInfo = (h, { idKey, statusKey, statusModule, data, list }) => {
  return [
    {
      field: idKey,
      title: 'ID',
      slots: {
        default: ({ row }) => {
          return [
            <div class='text-truncate'>
              <list-body-cell-wrap copy row={ data } list={ list } field={ idKey } title={ row[idKey] } />
            </div>,
          ]
        },
      },
    },
    {
      field: statusKey,
      title: '状态',
      slots: {
        default: ({ row }) => {
          if (statusModule) {
            return [<status status={ row[statusKey] } statusModule={ statusModule } />]
          }
          return '-'
        },
      },
    },
    {
      field: 'project_domain',
      title: '域',
      formatter: ({ row }) => {
        return row.project_domain || '-'
      },
    },
    {
      field: 'tenant',
      title: '项目',
      formatter: ({ row }) => {
        return row.tenant || '-'
      },
    },
  ]
}

export default {
  name: 'Detail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    baseInfo: {
      type: Array,
      default: () => ([]),
    },
    extraInfo: {
      type: Array,
    },
    list: {
      type: Object,
    },
    nameRules: {
      type: Array,
    },
    statusModule: {
      type: String,
    },
    idKey: {
      type: String,
      default: 'id',
    },
    statusKey: {
      type: String,
      default: 'status',
    },
    nameProps: {
      type: Object,
    },
    descProps: {
      type: Object,
    },
  },
  computed: {
    commonBaseInfo () {
      let baseInfo = getDefaultTopBaseInfo(this.$createElement, {
        idKey: this.idKey,
        statusKey: this.statusKey,
        statusModule: this.statusModule,
        data: this.data,
        list: this.list,
      }).concat(this.baseInfo).concat(getDefaultLastBaseInfo(this.$createElement, {
        list: this.list,
        data: this.data,
      }))
      baseInfo = R.uniqBy(item => item.field, baseInfo)
      return baseInfo
    },
  },
  methods: {
    renderItem (h, item, renderTitle = true) {
      let val
      if (item.slots && item.slots.default) {
        val = item.slots.default({ row: this.data }, h)
      } else if (item.formatter) {
        val = item.formatter({ row: this.data, cellValue: this.data[item.field] }) || '-'
      } else {
        val = _.get(this.data, item.field) || '-'
      }
      const children = []
      if (renderTitle) {
        children.push(h('div', { class: 'detail-item-title' }, item.title))
      }
      children.push(<div class={classNames('detail-item-value', { 'ml-0': !renderTitle })}>{val}</div>)
      return h('div', {
        class: 'detail-item mt-2',
      }, children)
    },
    renderItems (h, items) {
      return h('div', {
        class: 'detail-items',
      }, items.map(item => {
        return this.renderItem(h, item)
      }))
    },
    renderTitle (h, icon, title) {
      return h('div', {
        class: 'detail-title',
      }, [
        h('icon', {
          props: {
            name: icon,
          },
        }),
        h('span', { class: 'ml-2' }, title),
      ])
    },
    renderContent (h, icon, title, items, item) {
      return h('div', {
        class: 'detail-content',
      }, [
        this.renderTitle(h, icon, title),
        items ? this.renderItems(h, items) : this.renderItem(h, item, false),
      ])
    },
    renderBase (h) {
      return h('div', {
        class: 'detail-left',
      }, [
        this.renderContent(h, 'info', '基本信息', this.commonBaseInfo),
      ])
    },
    renderExtra (h) {
      return h('div', {
        class: 'detail-right',
      }, this.extraInfo.map(item => {
        return this.renderContent(h, 'info2', item.title, item.items, item)
      }))
    },
    renderCommon (h) {
      return [
        h('list-body-cell-wrap', {
          props: {
            copy: true,
            edit: true,
            row: this.data,
            list: this.list,
            formRules: this.nameRules,
            titleClass: 'h4',
            ...this.nameProps,
          },
          class: ['m-0'],
        }),
        h('div', {
          class: 'd-flex mt-2 small-text',
        }, [
          h('span', '备注: '),
          h('list-body-cell-wrap', {
            props: {
              copy: true,
              edit: true,
              row: this.data,
              list: this.list,
              field: 'description',
              ...this.descProps,
            },
            style: { color: '#999' },
            class: ['mb-0 ml-2'],
          }),
        ]),
      ]
    },
  },
  render (h, ctx) {
    return (
      <div class='detail-wrap'>
        { this.renderCommon(h) }
        { this.renderBase(h) }
        { this.extraInfo && this.renderExtra(h) }
      </div>
    )
  },
}
