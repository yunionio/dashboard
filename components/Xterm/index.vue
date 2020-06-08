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
  },
  data () {
    return {
      socket: null,
    }
  },
  watch: {
    connectParams: {
      handler () {
        this.initTerminal()
      },
      immediate: true,
    },
  },
  beforeDestroy () {
    this._socketClose()()
  },
  methods: {
    _createDom () {
      const wrapper = this.$refs.xtermWrapper
      const terminalDom = document.getElementById('xterm')
      wrapper.removeChild(terminalDom)
      const newTerminalDom = document.createElement('div')
      newTerminalDom.setAttribute('id', 'xterm')
      wrapper.appendChild(newTerminalDom)
      newTerminalDom.style.minHeight = 600 + 'px'
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
      const term = new Terminal({
        cols: 80,
        rows: 24,
        ScrollBar: true,
      })
      const terminalDom = this._createDom()
      term.open(terminalDom)
      term.focus()
      // term.fit()
      term.on('resize', size => {
        this.socket.emit('resize', [size.cols, size.rows])
      })
      term.on('data', data => this.socket.emit('input', data))
      term.on('keypress', (val, e) => {
        e.preventDefault()
      })
      this.socket.on('output', arrayBuffer => {
        term.write(arrayBuffer)
      })
      this.socket.on('disconnection', this._socketClose())
      window.addEventListener('resize', () => {
        term.fit()
      })
      term.fit()
    },
    _socketClose () {
      return () => {
        console.log('Connection lose!!!')
        this.socket.close()
      }
    },
  },
}
</script>
