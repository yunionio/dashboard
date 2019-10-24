import './style.scss'
import * as R from 'ramda'
import moment from 'moment'

const DEFAULT_BASE_INFO = [
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

export default {
  name: 'Detail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    baseInfo: {
      type: Array,
      required: true,
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
  },
  methods: {
    renderItem (h, item) {
      let val
      if (item.slots && item.slots.default) {
        val = item.slots.default({ row: this.data }, h)
      } else if (item.formatter) {
        val = item.formatter({ row: this.data, cellValue: this.data[item.field] })
      } else {
        val = this.data[item.field] || '-'
      }
      return h('div', {
        class: 'detail-item mt-2',
      }, [
        h('div', { class: 'detail-item-title' }, item.title),
        h('div', { class: 'detail-item-value', attrs: { title: val } }, val),
      ])
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
    renderContent (h, icon, title, items) {
      return h('div', {
        class: 'detail-content',
      }, [
        this.renderTitle(h, icon, title),
        this.renderItems(h, items),
      ])
    },
    renderBase (h) {
      const baseInfo = R.unionWith(R.eqBy(R.prop('field')), this.baseInfo, DEFAULT_BASE_INFO)
      return h('div', {
        class: 'detail-left',
      }, [
        this.renderContent(h, 'info', '基本信息', baseInfo),
      ])
    },
    renderExtra (h) {
      return h('div', {
        class: 'detail-right',
      }, this.extraInfo.map(item => {
        return this.renderContent(h, 'info2', item.title, item.items)
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
          },
          class: ['h4 m-0'],
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
