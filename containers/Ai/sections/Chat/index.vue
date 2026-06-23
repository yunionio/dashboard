<template>
  <div class="mcp-chat-container">
    <div class="chat-header">
      <h3>{{ $t('ai.mcp.chat') }}</h3>
      <a-popover
        v-if="isMcpResource && mcpTools.length > 0"
        v-model="toolsPopoverVisible"
        :title="$t('ai.mcp.available_tools')"
        placement="bottomRight"
        trigger="click"
        :overlay-style="{ maxWidth: '400px', maxHeight: '400px' }">
        <template slot="content">
          <div class="tools-list">
            <div
              v-for="tool in mcpTools"
              :key="tool.name"
              class="tool-item"
              @click="insertToolExample(tool)">
              <div class="tool-name">{{ tool.name }}</div>
              <div class="tool-desc">{{ tool.description }}</div>
            </div>
          </div>
        </template>
        <a-button
          size="small"
          type="link">
          {{ $t('ai.mcp.show_tools') }} ({{ mcpTools.length }})
        </a-button>
      </a-popover>
      <div v-if="isChatTest" class="chat-test-header-config">
        <base-select
          v-model="selectedVirtualKeyId"
          resource="ai_virtual_keys"
          :params="virtualKeySelectParams"
          filterable
          version="v2"
          class="chat-test-vk-select"
          :select-props="virtualKeySelectProps"
          @change="onVirtualKeyChange" />
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(message, index) in messages"
        :key="`${index}-${message.content.length}-${message.reasoning ? message.reasoning.length : 0}`"
        :class="['message-item', message.role]">
        <div class="message-avatar">
          <a-icon v-if="message.role === 'user'" type="user" />
          <icon v-else type="ai" class="message-avatar-ai" />
        </div>
        <div class="message-content">
          <template v-if="isChatTest && message.role === 'assistant'">
            <div
              v-if="message.reasoning"
              class="message-reasoning"
              :class="{ 'is-expanded': isReasoningExpanded(index) }">
              <a-icon
                class="reasoning-arrow"
                :type="isReasoningExpanded(index) ? 'down' : 'right'"
                @click="toggleReasoning(index)" />
              <div class="reasoning-content" @click="toggleReasoning(index)">
                <vue-markdown :source="getMessageContent(message.reasoning)" />
              </div>
            </div>
            <div v-if="message.content" class="message-text">
              <vue-markdown :source="getMessageContent(message.content)" />
            </div>
          </template>
          <div v-else class="message-text">
            <vue-markdown :source="getMessageContent(message.content)" />
          </div>
          <div class="message-time">{{ $moment(message.time).format('YYYY-MM-DD HH:mm:ss') }}</div>
        </div>
      </div>
      <div v-if="loading" class="message-item assistant">
        <div class="message-avatar">
          <icon type="ai" class="message-avatar-ai" />
        </div>
        <div class="message-content">
          <div class="message-text">
            <a-spin size="small" />
            <span class="ml-2">{{ $t('ai.mcp.thinking') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <a-textarea
        v-model="inputMessage"
        :placeholder="$t('ai.mcp.input_placeholder')"
        :auto-size="{ minRows: 2, maxRows: 6 }"
        @keydown.ctrl.enter="handleSend"
        @keydown.meta.enter="handleSend"
          :disabled="loading || !canSend" />
      <div class="input-actions">
        <a-button
          type="primary"
          :loading="loading"
          :disabled="!inputMessage.trim() || !canSend"
          @click="handleSend">
          {{ $t('ai.mcp.send') }}
        </a-button>
        <a-button
          v-if="messages.length > 0"
          @click="handleClear">
          {{ $t('ai.mcp.clear') }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import WindowsMixin from '@/mixins/windows'
import { Manager } from '@/utils/manager'
import { getAiproxySelectParams } from '@Ai/constants/aiproxyResources'
import {
  buildChatTestRequestConfig,
  isPlaceholderApiKey,
  resolveAiproxyChatCompletionsUrl,
} from '@Ai/utils/aiproxyEndpoint'
import { splitThinkingContent } from '@Ai/utils/chatContent'

export default {
  name: 'AiChat',
  components: {
    VueMarkdown,
  },
  mixins: [WindowsMixin],
  props: {
    mode: {
      type: String,
      default: 'mcpResource',
      validator: value => ['mcpResource', 'chatTest'].includes(value),
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    resId: {
      type: String,
      default: '',
    },
    initialVirtualKeyId: {
      type: String,
      default: '',
    },
    initialVirtualKey: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      messages: [],
      inputMessage: '',
      loading: false,
      mcpTools: [],
      toolsPopoverVisible: false,
      selectedVirtualKeyId: undefined,
      selectedVirtualKey: '',
      endpointUrl: '',
      endpointLoading: false,
      virtualKeyLoading: false,
      chatTestConfig: null,
      abortController: null,
      expandedReasoningMap: {},
      chatTestGreetingShown: false,
    }
  },
  computed: {
    isMcpResource () {
      return this.mode === 'mcpResource'
    },
    isChatTest () {
      return this.mode === 'chatTest'
    },
    canSend () {
      if (this.isChatTest) return !!this.chatTestConfig
      return true
    },
    virtualKeySelectParams () {
      return getAiproxySelectParams(this, 'ai_virtual_keys', { enabled: true })
    },
    virtualKeySelectProps () {
      return {
        placeholder: this.$t('aice.llm_deployment.chat_test_select_vk'),
        allowClear: true,
      }
    },
  },
  watch: {
    initialVirtualKeyId (val) {
      if (this.isChatTest && val) {
        this.applyInitialVirtualKey(val, this.initialVirtualKey)
      }
    },
    initialVirtualKey (val) {
      if (this.isChatTest && this.initialVirtualKeyId && val) {
        this.applyInitialVirtualKey(this.initialVirtualKeyId, val)
      }
    },
    'data.aiproxy_routing_id' () {
      if (this.isChatTest) {
        this.loadChatTestEndpoint()
      }
    },
    'data.aiproxy_bindings' () {
      if (this.isChatTest) {
        this.applyChatTestConfig()
      }
    },
  },
  created () {
    if (this.isMcpResource) {
      this.initGreetingMessage()
      this.fetchMcpTools()
    } else {
      this.loadChatTestEndpoint()
      if (this.initialVirtualKeyId) {
        this.applyInitialVirtualKey(this.initialVirtualKeyId, this.initialVirtualKey)
      }
    }
  },
  beforeDestroy () {
    this.abortRequest()
  },
  methods: {
    initGreetingMessage () {
      const greetingMessage = {
        role: 'assistant',
        content: this.$t('ai.mcp.greeting'),
        time: new Date(),
      }
      this.messages.push(greetingMessage)
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    initChatTestGreetingMessage () {
      if (!this.isChatTest || this.chatTestGreetingShown || !this.chatTestConfig) return
      const greetingText = this.$t('ai.mcp.greeting')
      const hasGreeting = this.messages.some(
        item => item.role === 'assistant' && item.content === greetingText,
      )
      this.chatTestGreetingShown = true
      if (hasGreeting) return
      this.initGreetingMessage()
    },
    async fetchMcpTools () {
      if (!this.isMcpResource || !this.resId) return

      try {
        const response = await new this.$Manager(`mcp_agents/${this.resId}/mcp-tools`, 'v2').list({
          params: {
            scope: this.$store.getters.scope,
          },
        })
        if (response.data && Array.isArray(response.data)) {
          this.mcpTools = response.data
        }
      } catch (error) {
        console.error('Failed to fetch MCP tools:', error)
      }
    },
    async handleSend () {
      if (!this.inputMessage.trim() || this.loading) return
      if (this.isChatTest && !this.chatTestConfig) {
        this.$message.warning(this.$t('ai.mcp.chat_test.api_key_required'))
        return
      }

      const userMessage = {
        role: 'user',
        content: this.inputMessage.trim(),
        time: new Date(),
      }
      this.messages.push(userMessage)
      this.inputMessage = ''
      this.loading = true

      const assistantMessage = {
        role: 'assistant',
        content: '',
        ...(this.isChatTest ? { reasoning: '', rawContent: '' } : {}),
        time: new Date(),
      }
      this.messages.push(assistantMessage)
      const assistantMessageIndex = this.messages.length - 1
      const userMessageIndex = assistantMessageIndex - 1
      let history = []
      if (this.isMcpResource) {
        const greetingText = this.$t('ai.mcp.greeting')
        history = this.messages
          .slice(0, userMessageIndex)
          .filter(m => !(m.role === 'assistant' && m.content === greetingText))
          .slice(-6)
      } else {
        const greetingText = this.$t('ai.mcp.greeting')
        history = this.messages
          .slice(0, userMessageIndex)
          .map(item => ({
            role: item.role,
            content: item.role === 'assistant' ? (item.content || '') : item.content,
          }))
          .filter(item => item.content)
          .filter(item => !(item.role === 'assistant' && item.content === greetingText))
          .slice(-6)
      }

      this.$nextTick(() => {
        this.scrollToBottom()
      })

      try {
        await this.streamChatResponse(userMessage, assistantMessageIndex, history)
      } catch (error) {
        console.error('Chat error:', error)
        if (error.name !== 'AbortError') {
          this.$set(this.messages[assistantMessageIndex], 'content', this.$t('ai.mcp.error_occurred'))
          this.$message.error(this.$t('ai.mcp.send_failed'))
        }
      } finally {
        this.loading = false
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    async streamChatResponse (message, assistantMessageIndex, history = []) {
      this.abortController = new AbortController()

      try {
        if (this.isChatTest) {
          await this.streamChatTestResponse(message, assistantMessageIndex, history)
          return
        }
        await this.streamMcpChatResponse(message, assistantMessageIndex, history)
      } catch (error) {
        if (error.name === 'AbortError') {
          throw error
        }
        throw error
      } finally {
        this.abortController = null
      }
    },
    async streamMcpChatResponse (message, assistantMessageIndex, history = []) {
      const baseURL = this.$http.defaults.baseURL || process.env.VUE_APP_BASE_API || ''
      const apiVersion = 'v1'
      const resource = 'mcp_agents'
      const action = 'chat-stream'
      const url = `${baseURL}/${apiVersion}/${resource}/${this.resId}/${action}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'text/event-stream; charset=utf-8',
          'Accept-Charset': 'utf-8',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: {
            role: message.role,
            content: message.content,
          },
          history,
        }),
        signal: this.abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/event-stream') || contentType.includes('application/stream+json') || contentType.includes('application/json')) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const ls = buffer.split('data: \n')
          const lines = []
          ls.forEach(l => {
            lines.push(...l.split('\n'))
            lines.push('data: \n')
          })
          lines.filter(line => line)
          buffer = lines.pop() || ''

          for (const line of lines) {
            this.appendStreamLine(line, assistantMessageIndex, 'mcp')
          }

          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }

        if (buffer.trim()) {
          this.appendStreamLine(buffer, assistantMessageIndex, 'mcp')
        }
      } else {
        const text = await response.text()
        try {
          const data = JSON.parse(text)
          const content = data.content || data.text || data.message || text
          this.$set(this.messages[assistantMessageIndex], 'content', content)
        } catch (e) {
          this.$set(this.messages[assistantMessageIndex], 'content', text)
        }
      }
    },
    async streamChatTestResponse (message, assistantMessageIndex, history = []) {
      const { url, headers, body: bodyTemplate } = this.chatTestConfig
      const messages = [
        ...history.map(item => ({ role: item.role, content: item.content })),
        { role: message.role, content: message.content },
      ]
      const requestBody = {
        ...bodyTemplate,
        messages,
        stream: true,
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          ...headers,
        },
        body: JSON.stringify(requestBody),
        signal: this.abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await this.consumeStreamResponse(response, assistantMessageIndex, 'openai')
    },
    async consumeStreamResponse (response, assistantMessageIndex, format = 'mcp') {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/event-stream') || contentType.includes('application/stream+json') || contentType.includes('application/json')) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const chunks = buffer.split('\n')
          buffer = chunks.pop() || ''

          for (const line of chunks) {
            this.appendStreamLine(line, assistantMessageIndex, format)
          }

          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }

        if (buffer.trim()) {
          this.appendStreamLine(buffer, assistantMessageIndex, format)
        }
      } else {
        const text = await response.text()
        try {
          const data = JSON.parse(text)
          const raw = this.extractOpenAiContent(data) || data.content || data.text || data.message || text
          if (format === 'openai') {
            this.applyChatTestContent(assistantMessageIndex, raw)
          } else {
            this.$set(this.messages[assistantMessageIndex], 'content', raw)
          }
        } catch (e) {
          if (format === 'openai') {
            this.applyChatTestContent(assistantMessageIndex, text)
          } else {
            this.$set(this.messages[assistantMessageIndex], 'content', text)
          }
        }
      }
    },
    appendStreamLine (line, assistantMessageIndex, format) {
      if (format === 'openai') {
        this.appendOpenAiStreamLine(line, assistantMessageIndex)
        return
      }

      if (line === 'data: \\n' || line === 'data: \n') {
        const newContent = (this.messages[assistantMessageIndex].content || '') + '\n'
        this.$set(this.messages[assistantMessageIndex], 'content', newContent)
        return
      }

      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data:')) return

      let payload = trimmed.slice(5)
      if (payload.startsWith(' ')) payload = payload.slice(1)
      const newContent = (this.messages[assistantMessageIndex].content || '') + payload
      this.$set(this.messages[assistantMessageIndex], 'content', newContent)
    },
    appendOpenAiStreamLine (line, assistantMessageIndex) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) return

      const payload = trimmed.slice(5).trim()
      if (!payload || payload === '[DONE]') return

      try {
        const data = JSON.parse(payload)
        const delta = this.extractOpenAiContent(data)
        if (delta) {
          this.appendChatTestDelta(assistantMessageIndex, delta)
        }
      } catch (e) {
        // ignore malformed chunk
      }
    },
    extractOpenAiContent (data) {
      return data?.choices?.[0]?.delta?.content ||
        data?.choices?.[0]?.message?.content ||
        ''
    },
    appendChatTestDelta (assistantMessageIndex, delta) {
      const message = this.messages[assistantMessageIndex]
      const rawContent = (message.rawContent || '') + delta
      this.applyChatTestContent(assistantMessageIndex, rawContent, rawContent)
    },
    applyChatTestContent (assistantMessageIndex, rawContent, rawContentToStore = rawContent) {
      const { reasoning, content } = splitThinkingContent(rawContent)
      this.$set(this.messages[assistantMessageIndex], 'rawContent', rawContentToStore)
      this.$set(this.messages[assistantMessageIndex], 'reasoning', reasoning)
      this.$set(this.messages[assistantMessageIndex], 'content', content)
    },
    getChatTestModel () {
      const bindings = Array.isArray(this.data?.aiproxy_bindings) ? this.data.aiproxy_bindings : []
      const ready = bindings.filter(item => {
        if (!item?.client_model_alias) return false
        return item.sync_status === 'synced' || !item.sync_status
      })
      return ready[0]?.client_model_alias || ''
    },
    async loadChatTestEndpoint () {
      this.endpointLoading = true
      try {
        this.endpointUrl = await resolveAiproxyChatCompletionsUrl(this, {
          routingId: this.data?.aiproxy_routing_id,
        })
      } catch (e) {
        this.endpointUrl = ''
      } finally {
        this.endpointLoading = false
        this.applyChatTestConfig()
      }
    },
    async onVirtualKeyChange (id) {
      if (!id) {
        this.selectedVirtualKey = ''
        this.applyChatTestConfig()
        return
      }
      await this.fetchVirtualKeySecret(id)
    },
    async fetchVirtualKeySecret (id) {
      if (!id) {
        this.selectedVirtualKey = ''
        this.applyChatTestConfig()
        return
      }
      this.virtualKeyLoading = true
      try {
        const manager = new Manager('ai_virtual_keys')
        const { data } = await manager.get({
          id,
          params: getAiproxySelectParams(this, 'ai_virtual_keys'),
        })
        this.selectedVirtualKey = data?.virtual_key || ''
      } catch (e) {
        this.selectedVirtualKey = ''
      } finally {
        this.virtualKeyLoading = false
        this.applyChatTestConfig()
      }
    },
    applyChatTestConfig () {
      const model = this.getChatTestModel()
      if (!this.endpointUrl || !this.selectedVirtualKey || !model) {
        this.chatTestConfig = null
        return
      }
      if (isPlaceholderApiKey(`Bearer ${this.selectedVirtualKey}`)) {
        this.chatTestConfig = null
        return
      }
      this.chatTestConfig = buildChatTestRequestConfig({
        endpoint: this.endpointUrl,
        model,
        virtualKey: this.selectedVirtualKey,
      })
      this.initChatTestGreetingMessage()
    },
    async applyInitialVirtualKey (virtualKeyId, virtualKey = '') {
      this.selectedVirtualKeyId = virtualKeyId
      if (virtualKey) {
        this.selectedVirtualKey = virtualKey
        this.applyChatTestConfig()
        return
      }
      await this.fetchVirtualKeySecret(virtualKeyId)
    },
    abortRequest () {
      if (this.abortController) {
        this.abortController.abort()
        this.abortController = null
      }
    },
    handleClear () {
      this.messages = []
      this.inputMessage = ''
      this.expandedReasoningMap = {}
      this.chatTestGreetingShown = false
      if (this.isChatTest && this.chatTestConfig) {
        this.initChatTestGreetingMessage()
      }
      this.abortRequest()
    },
    scrollToBottom () {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    getMessageContent (content) {
      if (!content) return ''
      const normalized = content
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
      return normalized.replace(/\n+$/, '').replace(/[ \t]+$/, '')
    },
    isReasoningExpanded (index) {
      return !!this.expandedReasoningMap[index]
    },
    toggleReasoning (index) {
      this.$set(this.expandedReasoningMap, index, !this.expandedReasoningMap[index])
    },
    insertToolExample (tool) {
      const example = `${this.$t('ai.mcp.use_tool')} ${tool.name}: ${tool.description}`
      this.inputMessage = example
      this.toolsPopoverVisible = false
    },
  },
}
</script>

<style lang="less" scoped>
.mcp-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }

  .chat-test-header-config {
    flex: 1;
    max-width: 360px;
    margin-left: 16px;

    .chat-test-vk-select {
      width: 100%;
    }
  }
}

.tools-list {
  max-height: 350px;
  overflow-y: auto;
  padding: 4px 0;
}

.tool-item {
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  .tool-name {
    font-weight: 500;
    color: #1890ff;
    margin-bottom: 4px;
  }

  .tool-desc {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  .message-item {
    display: flex;
    margin-bottom: 16px;

    &.user {
      flex-direction: row-reverse;

      .message-content {
        background: #1890ff;
        color: #fff;
        margin-right: 12px;
        margin-left: 60px;
      }
    }

    &.assistant {
      .message-content {
        background: #fff;
        margin-left: 12px;
        margin-right: 60px;
      }
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f0f0;
      flex-shrink: 0;

      .anticon {
        font-size: 16px;
        color: #666;
      }

      .message-avatar-ai {
        font-size: 18px;
        color: #666;
      }
    }

    .message-content {
      padding: 12px 16px;
      border-radius: 8px;
      max-width: 85%;
      word-wrap: break-word;

      .message-reasoning {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px dashed #e8e8e8;

        .reasoning-arrow {
          flex-shrink: 0;
          margin-top: 4px;
          color: #bbb;
          font-size: 10px;
          cursor: pointer;
        }

        .reasoning-content {
          flex: 1;
          min-width: 0;
          font-size: 12px;
          line-height: 1.5;
          color: #999;
          cursor: pointer;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        &.is-expanded .reasoning-content {
          display: block;
          overflow: visible;
          -webkit-line-clamp: unset;
          color: #666;
        }
      }

      .message-text {
        line-height: 1.6;

        /deep/ h1, /deep/ h2, /deep/ h3, /deep/ h4, /deep/ h5, /deep/ h6 {
          margin: 12px 0 8px 0;
          font-weight: 600;
          line-height: 1.4;
        }

        /deep/ h1 { font-size: 1.5em; }
        /deep/ h2 { font-size: 1.3em; }
        /deep/ h3 { font-size: 1.1em; }

        /deep/ p {
          margin: 8px 0;
        }

        /deep/ ul, /deep/ ol {
          margin: 8px 0;
          padding-left: 24px;
        }

        /deep/ li {
          margin: 4px 0;
        }

        /deep/ blockquote {
          margin: 8px 0;
          padding: 8px 16px;
          border-left: 4px solid #ddd;
          background: #f5f5f5;
          color: #666;
        }

        /deep/ code {
          padding: 2px 6px;
          background: #f5f5f5;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }

        /deep/ pre {
          margin: 12px 0;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 4px;
          overflow-x: auto;

          code {
            padding: 0;
            background: transparent;
          }
        }

        /deep/ a {
          color: #1890ff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }

        /deep/ table {
          border-collapse: collapse;
          margin: 12px 0;
          width: 100%;
          display: block;
          overflow-x: auto;

          th,
          td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
            white-space: nowrap;
          }

          th {
            background: #f5f5f5;
            font-weight: 600;
          }

          th:first-child,
          td:first-child {
            position: sticky;
            left: 0;
            z-index: 1;
            background: #fff;
            box-shadow: inset -1px 0 0 #ddd;
          }

          thead th:first-child {
            z-index: 2;
            background: #f5f5f5;
          }
        }

        /deep/ hr {
          margin: 16px 0;
          border: none;
          border-top: 1px solid #e8e8e8;
        }

        /deep/ img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 8px 0;
        }
      }

      .message-time {
        margin-top: 4px;
        font-size: 12px;
        opacity: 0.7;
      }
    }
  }
}

.chat-input-area {
  padding: 16px 0;
  background: #fff;
  border-top: 1px solid #e8e8e8;

  .input-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
}
</style>
