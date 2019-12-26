const resourceMode = {
  networks: {
    vnode: (vm, h) => {
      const text = vm.getLabel()
      return ( // IP子网
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ text }>{ text }</span>
          <span style="color: #8492a6; font-size: 13px">可用: { vm.data.ports - vm.data.ports_used }</span>
        </div>
      )
    },
    labelFormat: item => `${item.name}（${item.guest_ip_start} - ${item.guest_ip_end}, vlan=${item.vlan_id}）`,
  },
}

export default {
  name: 'OptionLabel',
  props: {
    nameKey: {
      type: String,
      required: true,
    },
    labelFormat: {
      type: Function,
    },
    data: {
      type: Object,
      required: true,
    },
    resource: {
      type: String,
    },
  },
  data () {
    return {
      text: this.data[this.nameKey],
    }
  },
  methods: {
    getLabel () {
      let text = this.data[this.nameKey]
      const resourceItem = resourceMode[this.resource]
      if (this.labelFormat) {
        text = this.labelFormat(this.data)
      } else if (resourceItem && resourceItem.labelFormat) {
        text = resourceItem.labelFormat(this.data)
      }
      return (<div>{text}</div>)
    },
  },
  render (h) {
    const resourceItem = resourceMode[this.resource]
    if (this.resource) { // 兼容外传 options 的情况
      if (resourceItem && resourceItem.vnode) {
        return resourceItem.vnode(this, h)
      }
    }
    return this.getLabel()
  },
}
