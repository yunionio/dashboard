import './style.scss'

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
  },
  methods: {
    renderItem (h, item) {
      let val
      if (item.slots && item.slots.default) {
        val = item.slots.default(this.data, h)
      } else if (item.formatter) {
        val = item.formatter(this.data)
      } else {
        val = this.data[item.field]
      }
      return h('div', {
        class: 'detail-item mt-2',
      }, [
        h('div', { class: 'detail-item-title' }, item.title),
        h('div', { class: 'detail-item-value' }, val),
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
      return h('div', {
        class: 'detail-left',
      }, [
        this.renderContent(h, 'info', '基本信息', this.baseInfo),
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
      return h('div', {
        class: 'detail-common d-flex align-items-end',
      }, [
        h('h4', { class: 'm-0' }, this.data.name),
        h('p', {
          class: 'mb-0 ml-2',
          style: { color: '#999' },
        }, this.data.description || '无备注'),
      ])
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
