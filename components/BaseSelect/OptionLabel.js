const resourceMode = {
  networks: (vm, h) => {
    const text = vm.getLabel()
    return ( // IP子网
      <div class='d-flex'>
        <span class='text-truncate flex-fill mr-2' title={ text }>{ text }</span>
        <span style="color: #8492a6; font-size: 13px">可用: { vm.data.ports - vm.data.ports_used }</span>
      </div>
    )
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
      required: true,
    },
  },
  methods: {
    getLabel () {
      if (this.labelFormat) {
        return this.labelFormat(this.data)
      }
      return this.data[this.nameKey]
    },
  },
  render (h) {
    if (resourceMode[this.resource]) {
      return resourceMode[this.resource](this, h)
    }
    return this.getLabel()
  },
}
