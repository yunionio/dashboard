<script>
import { h } from 'vue'
import * as R from 'ramda'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'PageListActionButton',
  props: {
    item: {
      type: Object,
    },
    row: {
      type: Object,
    },
    rows: {
      type: Array,
    },
    buttonType: {
      type: String,
      default: 'link',
    },
    buttonSize: {
      type: String,
      default: 'default',
    },
    buttonStyle: {
      type: Object,
    },
    buttonBlock: {
      type: Boolean,
      default: false,
    },
    // 是否作为 popover 的 trigger 渲染
    popoverTrigger: Boolean,
  },
  computed: {
    label () {
      return this.item.label
    },
    meta () {
      const { validate = true, ...rest } = R.is(Function, this.item.meta) ? this.item.meta(this.row) : {}
      return {
        validate,
        ...rest,
      }
    },
    extraMeta () {
      const { validate = true, ...rest } = R.is(Function, this.item.extraMeta) ? this.item.extraMeta(this.row) : {}
      return {
        validate,
        ...rest,
      }
    },
    disabled () {
      const isValidate = this.meta.validate
      const isExtraValidate = this.extraMeta?.validate
      let isPermission = true
      // singleAction判断
      if (this.item.permission && this.row) {
        isPermission = hasPermission({ key: this.item.permission, resourceData: this.row })
      }
      // groupActions判断
      if (this.item.permission && !this.row && this.rows && this.rows.length && this.meta.buttonType !== 'primary') {
        isPermission = this.rows.every(item => {
          return hasPermission({ key: this.item.permission, resourceData: item })
        })
      }
      if (this.item.permission && !this.row && ((!this.rows || !this.rows.length) || this.meta.buttonType === 'primary')) {
        isPermission = hasPermission({ key: this.item.permission, resourceData: null })
      }
      return !isValidate || !isPermission || !isExtraValidate
    },
    tooltip () {
      return this.meta.tooltip || this.extraMeta.tooltip
    },
  },
  methods: {
    handleClick (e) {
      e.stopPropagation()
      if (this.disabled) return
      this.$emit('hidden-popover', e)
      this.item.action(this.row)
      // this.$emit('clear-selected')
    },
    handlePopoverClick (e) {
      e.stopPropagation()
      this.$emit('click', e)
    },
  },
  render () {
    const v = []
    let action
    if (this.popoverTrigger) {
      action = <a-button style={ this.buttonStyle } block={ this.buttonBlock } size={ this.buttonSize } type={ this.meta.buttonType || this.buttonType } disabled={ this.disabled } onClick={ this.handlePopoverClick }>{ this.label }<icon class='ml-1' type='pull-down' /></a-button>
    } else {
      action = <a-button style={ this.buttonStyle } block={ this.buttonBlock } size={ this.buttonSize } type={ this.meta.buttonType || this.buttonType } disabled={ this.disabled } onClick={ this.handleClick }>{ this.label }</a-button>
    }
    if (this.tooltip) {
      action = <a-tooltip title={ this.tooltip } placement='left' destroyTooltipOnHide>{ action }</a-tooltip>
    }
    if (this.item.render) {
      action = this.item.render(this.row, { style: this.buttonStyle, block: this.buttonClock, size: this.buttonSize, type: this.meta.buttonType || this.buttonType, disabled: this.disabled, onClick: this.handleClick }, h)
    }
    v.push(action)
    return v
  },
}
</script>
