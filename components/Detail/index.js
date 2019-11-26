import './style.scss'
import * as R from 'ramda'
import moment from 'moment'
import classNames from 'classnames'

const DEFAULT_LAST_BASE_INFO = [
  {
    field: 'created_at',
    title: '创建时间',
    formatter: ({ row }) => {
      return moment(row.created_at).format()
    },
  },
  {
    field: 'updated_at',
    title: '更新时间',
    formatter: ({ row }) => {
      return moment(row.updated_at).format()
    },
  },
]

const getDefaultTopBaseInfo = (h, { idKey, statusKey, statusModule, data, list }) => {
  return [
    {
      field: idKey,
      title: 'ID',
      slots: {
        default: ({ row }) => {
          return [<list-body-cell-wrap copy row={ data } list={ list } field={ idKey } />]
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
  },
  computed: {
    commonBaseInfo () {
      let baseInfo = getDefaultTopBaseInfo(this.$createElement, {
        idKey: this.idKey,
        statusKey: this.statusKey,
        statusModule: this.statusModule,
        data: this.data,
        list: this.list,
      }).concat(this.baseInfo).concat(DEFAULT_LAST_BASE_INFO)
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
        val = item.formatter({ row: this.data, cellValue: this.data[item.field] })
      } else {
        val = this.data[item.field] || '-'
      }
      const children = []
      if (renderTitle) {
        children.push(h('div', { class: 'detail-item-title' }, item.title))
      }
      children.push(<div class={classNames('detail-item-value', { 'ml-0': !renderTitle })} title={val}>{val}</div>)
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
