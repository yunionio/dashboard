const sizerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  visibility: 'hidden',
  height: 0,
  overflow: 'scroll',
  whiteSpace: 'pre',
}

const copyStyles = (styles, node) => {
  node.style.fontSize = styles.fontSize
  node.style.fontFamily = styles.fontFamily
  node.style.fontWeight = styles.fontWeight
  node.style.fontStyle = styles.fontStyle
  node.style.letterSpacing = styles.letterSpacing
  node.style.textTransform = styles.textTransform
}

const isIE = (typeof window !== 'undefined' && window.navigator) ? /MSIE |Trident\/|Edge\//.test(window.navigator.userAgent) : false

const generateId = () => {
  // we only need an auto-generated ID for stylesheet injection, which is only
  // used for IE. so if the browser is not IE, this should return undefined.
  return isIE ? '_' + Math.random().toString(36).substr(2, 12) : undefined
}

const getListeners = context => {
  return (context.$vnode ? context.$vnode.componentOptions.listeners : context.$listeners) || {}
}

export default {
  name: 'AutosizeInput',
  props: {
    // id to use for the input, can be set for consistent snapshots
    id: String,
    // minimum width for input element
    minWidth: {
      type: [String, Number],
      default: 1,
    },
    // additional width for input element
    extraWidth: [String, Number],
    // don't collapse size to less than the placeholder
    placeholderIsMinWidth: Boolean,
    // inject the custom stylesheet to hide clear UI, defaults to true
    injectStyles: {
      type: Boolean,
      default: true,
    },
    // placeholder text
    placeholder: String,
    // class for the input element
    inputClass: String,
    // css styles for the input element
    inputStyle: Object,
    // size change callback
    sizeChange: Function,
    // input type
    type: {
      type: String,
      default: 'text',
    },
    // field value
    value: {
      required: true,
    },
  },
  data () {
    return {
      inputWidth: this.minWidth,
      inputId: this.id || generateId(),
    }
  },
  watch: {
    value (val, oldVal) {
      if (val !== oldVal) {
        this.$nextTick(() => {
          this.updateInputWidth()
        })
      }
    },
    inputWidth (val, oldVal) {
      if (val !== oldVal) {
        this.sizeChange && this.sizeChange(val)
      }
    },
  },
  mounted () {
    this.input = this.$refs.input
    this.sizer = this.$refs.sizer
    this.placeHolderSizer = this.$refs.placeHolderSizer
    this.copyInputStyles()
    this.updateInputWidth()
  },
  methods: {
    getInput () {
      return this.input
    },
    focus () {
      this.input.focus()
    },
    blur () {
      this.input.blur()
    },
    select () {
      this.input.select()
    },
    copyInputStyles () {
      if (!window.getComputedStyle) {
        return
      }
      const inputStyles = this.input && window.getComputedStyle(this.input)
      if (!inputStyles) {
        return
      }
      copyStyles(inputStyles, this.sizer)
      if (this.placeHolderSizer) {
        copyStyles(inputStyles, this.placeHolderSizer)
      }
    },
    updateInputWidth () {
      if (!this.sizer || typeof this.sizer.scrollWidth === 'undefined') {
        return
      }
      let newInputWidth
      if (this.placeholder && (!this.value || (this.value && this.placeholderIsMinWidth))) {
        newInputWidth = Math.max(this.sizer.scrollWidth, this.placeHolderSizer.scrollWidth) + 2
      } else {
        newInputWidth = this.sizer.scrollWidth + 2
      }
      // add extraWidth to the detected width. for number types, this defaults to 16 to allow for the stepper UI
      const extraWidth = (this.type === 'number' && this.extraWidth === undefined)
        ? 16 : parseInt(this.extraWidth) || 0
      newInputWidth += extraWidth
      if (newInputWidth < this.minWidth) {
        newInputWidth = this.minWidth
      }
      if (newInputWidth !== this.inputWidth) {
        this.inputWidth = newInputWidth
      }
    },
  },
  render (h) {
    return h('div', {
      class: this.inputClass,
      style: {
        display: 'inline-block',
      },
    }, [
      isIE && this.injectStyles ? h('style', `input#${this.inputId}::-ms-clear {display: none;}`) : null,
      h('input', {
        ref: 'input',
        class: this.inputClass,
        style: {
          boxSizing: 'content-box',
          width: `${this.inputWidth}px`,
          ...this.inputStyle,
        },
        domProps: {
          value: this.value,
          type: this.type,
          id: this.inputId,
          placeholder: this.placeholder,
        },
        on: {
          input: e => {
            this.$emit('input', e.target.value)
          },
          ...getListeners(this),
        },
      }),
      h('div', {
        ref: 'sizer',
        style: sizerStyle,
      }, this.value),
      this.placeholder ? h('div', {
        ref: 'placeHolderSizer',
        style: sizerStyle,
      }, this.placeholder) : null,
    ])
  },
}
