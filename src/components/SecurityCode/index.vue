<template>
  <div class="security-code-box" :class="{ 'has-error': error, 'security-code-box-small': isSmall }">
    <div class="security-code-box-inner">
      <div class="security-code-field" v-for="n in securityCodeLength" :key="n">
        <input
          :ref="`input${n}`"
          maxlength="1"
          autocorrect="off"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          type="tel"
          class="form-control ant-input-number"
          v-model="securityCode[n - 1]"
          @focus="setSelected"
          @input.stop="inputEvent"
          @keydown.stop="downEvent"
          @keypress.stop="pressEvent"
          @paste="pasteEvent(n - 1, $event)" />
      </div>
    </div>
    <div class="clear-btn" @click="onClean"><a-icon type="close-circle" /></div>
  </div>
</template>

<script>
export default {
  name: 'SecurityCode',
  props: {
    value: {
      type: [Number, String],
      required: true,
    },
    blurOnComplete: {
      type: Boolean,
      default: false,
    },
    securityCodeLength: {
      type: Number,
      default: 6,
    },
    error: Boolean,
    isSmall: Boolean,
  },
  data () {
    return {
      securityCode: new Array(this.securityCodeLength),
    }
  },
  mounted () {
    if (this.value !== 0) {
      this.securityCode = this.value.toString().substr(0, this.securityCodeLength).split('')
    }
  },
  methods: {
    inputEvent (event) {
      const value = event.target.value
      if (value.length > 1) {
        event.target.value = value.substr(0, 1)
      }
      if (this.getCodeString().length === this.securityCodeLength) {
        if (this.blurOnComplete) {
          event.target.blur()
        } else {
          this.nextElement(event)
        }
        this.$emit('completed')
      } else {
        if (event.target.value) {
          this.nextElement(event)
        }
      }
    },
    pasteEvent (index, event) {
      let pasteData
      const elements = event.target.parentNode.parentNode.childNodes
      let len = 0
      if (event.clipboardData && event.clipboardData.getData) {
        pasteData = event.clipboardData.getData('Text')
      } else if (window.clipboardData && window.clipboardData.getData) {
        pasteData = window.clipboardData.getData('Text')
      }
      pasteData = pasteData.replace(/\s/g, '').substr(0, elements.length - index).split('')
      for (let i = 0; i < elements.length && !isNaN(Number(pasteData[i])); i++) {
        len++
        elements[i + index].firstChild.value = pasteData[i]
        this.securityCode[i + index] = pasteData[i]
      }
      event.preventDefault()
      if (this.getCodeString().length === this.securityCodeLength) {
        if (this.blurOnComplete) {
          event.target.blur()
        } else {
          this.previousElement(event, this.getCodeString().length - 1)
        }
        this.$emit('completed')
      } else {
        this.previousElement(event, index + len)
      }
      return false
    },
    pressEvent (event) {
      const keyCode = event.which || event.keyCode
      if (
        this.isMainKeyCode(keyCode) ||
        this.isTab(keyCode) ||
        this.isBackspace(keyCode) ||
        this.isMetaKey(event, keyCode)
      ) {
        return undefined
      } else {
        return (event.preventDefault(), false)
      }
    },
    downEvent (event) {
      const parentNode = event.target.parentNode
      const keyCode = event.which || event.keyCode
      let _sibling
      if (keyCode === 8 && !event.target.value) {
        _sibling = parentNode.previousSibling
        if (_sibling) {
          _sibling.firstChild.focus()
        }
      } else if (keyCode >= 37 && keyCode <= 41) {
        switch (keyCode) {
          case 37:
            _sibling = parentNode.previousSibling
            break
          case 39:
            _sibling = parentNode.nextSibling
            break
        }
        if (_sibling) {
          _sibling.firstChild.focus()
        }
        return [event.preventDefault(), false]
      }
    },
    previousElement (event, length) {
      const elements = event.target.parentNode.parentNode.childNodes
      if (length >= elements.length) {
        length = elements.length - 1
      }
      elements[length].firstChild.focus()
    },
    nextElement (event) {
      const parentNode = event.target.parentNode
      const nextSibling = parentNode.nextSibling
      if (nextSibling) {
        nextSibling.firstChild.focus()
      } else {
        parentNode.focus()
      }
    },
    isMainKeyCode (keyCode) {
      return keyCode >= 48 && keyCode <= 57
    },
    isTab (keyCode) {
      return keyCode === 9
    },
    isBackspace (keyCode) {
      return keyCode === 8
    },
    isMetaKey (event, keyCode) {
      return event.metaKey && keyCode === 118
    },
    setSelected (event) {
      event.target.select()
    },
    getCodeString () {
      const code = this.securityCode.join('')
      this.$emit('input', code)
      return code
    },
    onClean () {
      this.securityCode = []
      this.$emit('input', '')
      this.$emit('clear')
    },
    focusInput (index = 1) {
      const el = this.$refs[`input${index}`][0]
      el.focus()
    },
  },
}
</script>

<style lang="less" scoped>
.security-code-box {
  position: relative;
  width: 519px;
  &-inner {
    display: inline-block;
    margin: auto;
    min-width: 240px;
    text-align: center;
    position: relative;
    .security-code-field {
      margin-right: 20px;
      float: left;
      .form-control {
        width: 64px;
        height: 64px;
        font-size: 30px;
        text-align: center;
        padding: 0;
        border-radius: 4px;
        background: #fff;
        background-clip: padding-box;
        border: 1px solid #d6d6d6;
      }
      &:nth-child(3) {
        margin-right: 55px;
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
  .clear-btn {
    position: absolute;
    top: 50%;
    right: -40px;
    margin-top: -15px;
    color: rgb(166, 174, 188);
    font-size: 20px;
    cursor: pointer;
    display: none;
    &:hover {
      color: rgba(166, 174, 188, .7);
    }
  }
  &.has-error {
    .clear-btn {
      display: block;
    }
    .security-code-box-inner {
      .security-code-field {
        .form-control {
          border: 1px solid #DD2727;
          color: #DD2727;
          &:focus {
            box-shadow: 0 0 0 3px rgba(221, 39, 39, .5);
            border: 1px solid #DD2727;
          }
        }
      }
    }
  }
}
.security-code-box-small {
  width: 310px;
  .security-code-box-inner {
    .security-code-field {
      margin-right: 10px;
      .form-control {
        width: 40px;
        height: 40px;
        font-size: 18px;
      }
      &:nth-child(3) {
        margin-right: 25px;
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
  .clear-btn {
    right: -25px;
    margin-top: -18px;
  }
}
</style>
