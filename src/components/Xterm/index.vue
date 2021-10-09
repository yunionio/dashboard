<template>
  <div id="k8s-xterm" ref="xtermWrapper" class="mt-3">
    <div id="xterm" style="min-height: 600px;" />
  </div>
</template>

<script>
import querystring from 'qs'
import { Terminal } from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import 'xterm/src/xterm.css'
import io from 'socket.io-client'

export default {
  name: 'Xterm',
  props: {
    connectParams: {
      type: String,
      required: true,
    },
    height: {
      type: Number,
      default: 600,
    },
  },
  data () {
    return {
      socket: null,
      term: null,
    }
  },
  watch: {
    connectParams: {
      handler (val, oval) {
        if (val) {
          this.initTerminal()
        } else {
          this.socket && this.socket.close()
          this._resetDom()
        }
      },
      immediate: true,
    },
    height (val, oval) {
      if (val) {
        const terminalDom = document.getElementById('xterm')
        terminalDom.style.minHeight = val + 'px'
        this.term && this.term.fit()
      }
    },
  },
  beforeDestroy () {
    this._socketClose()()
  },
  methods: {
    _resetDom () {
      const wrapper = this.$refs.xtermWrapper
      const terminalDom = document.getElementById('xterm')
      if (terminalDom && wrapper) {
        wrapper.removeChild(terminalDom)
      }
    },
    _createDom () {
      this._resetDom()
      const wrapper = this.$refs.xtermWrapper
      const newTerminalDom = document.createElement('div')
      newTerminalDom.setAttribute('id', 'xterm')
      wrapper.appendChild(newTerminalDom)
      newTerminalDom.style.minHeight = this.height + 'px'
      return newTerminalDom
    },
    initTerminal () {
      if (!this.connectParams) return
      const param = querystring.parse(this.connectParams)
      Terminal.applyAddon(fit)
      this.socket = io(param.api_server, {
        transports: ['websocket'],
        path: '/connect',
        query: {
          access_token: param.access_token,
        },
      })
      this.term = new Terminal({
        cols: 80,
        rows: 24,
        ScrollBar: true,
      })
      const terminalDom = this._createDom()
      this.term.open(terminalDom)
      this.term.focus()
      // term.fit()
      this.term.on('resize', size => {
        this.socket.emit('resize', [size.cols, size.rows])
      })
      this.term.on('data', data => this.socket.emit('input', data))
      this.term.on('keypress', (val, e) => {
        e.preventDefault()
      })
      this.socket.on('output', arrayBuffer => {
        this.term.write(arrayBuffer)
      })
      this.socket.on('disconnection', this._socketClose())
      this.socket.on('connect_error', this._socketClose())
      this.socket.on('disconnect', this._socketClose())
      this.socket.on('disconnecting', this._socketClose())
      window.addEventListener('resize', () => {
        this.term.fit()
      })
      this.term.fit()
    },
    _socketClose () {
      return () => {
        console.log('Connection lose!!!')
        this.socket && this.socket.close()
        this.$emit('close')
      }
    },
  },
}
</script>
