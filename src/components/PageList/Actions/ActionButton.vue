<script>
export default {
  name: 'PageListActionButton',
  props: {
    option: {
      type: Object,
    },
    buttonMode: {
      type: Boolean,
    },
    row: {
      type: Object,
    },
  },
  computed: {
    label () {
      return this.option.label
    },
    disabled () {
      return !this.option.meta.validate
    },
    tooltip () {
      return this.option.meta.tooltip
    },
    buttonType () {
      return this.option.meta.buttonType
    },
  },
  methods: {
    handleClick (e) {
      e.stopPropagation()
      e.preventDefault()
      if (this.disabled) return
      this.option.action(this.row)
      this.$emit('hidden-dropdown')
    },
  },
  render () {
    let v = []
    let action
    if (this.buttonMode) {
      action = <a-button class='list-action' type={ this.buttonType } disable={ this.disabled } onClick={ this.handleClick }>{ this.label }</a-button>
    } else {
      action = <a class={{ disabled: this.disabled, 'list-action': true }} onClick={ this.handleClick }>{ this.label }</a>
    }
    if (this.tooltip) {
      action = <a-tooltip title={ this.tooltip } placement='left'>{ action }</a-tooltip>
    }
    v.push(action)
    return v
  },
}
</script>

<style lang="scss" scoped>
.disabled {
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
}
.list-action {
  & + .list-action {
    margin-left: 5px;
  }
}
</style>
