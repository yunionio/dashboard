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
        <div class="chat-test-field">
          <div class="chat-test-field-label">{{ $t('ai.mcp.chat_test.protocol') }}</div>
          <a-select
            v-model="chatProtocol"
            class="chat-test-protocol-select"
            @change="onChatProtocolChange">
            <a-select-option
              v-for="item in chatProtocolOptions"
              :key="item.value"
              :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </div>
        <div class="chat-test-field chat-test-field-grow">
          <div class="chat-test-field-label">{{ $t('aice.aiproxy.virtual_key') }}</div>
          <base-select
            v-model="selectedVirtualKeyId"
            resource="ai_virtual_keys"
            :params="virtualKeySelectParams"
            :extra-opts="virtualKeyExtraOpts"
            filterable
            version="v2"
            class="chat-test-vk-select"
            :select-props="virtualKeySelectProps"
            @change="onVirtualKeySelectChange"
            @update:item="onVirtualKeyItemSelected" />
        </div>
        <div v-if="showChatModelSelect" class="chat-test-field">
          <div class="chat-test-field-label">{{ $t('aice.aiproxy.client_model_select') }}</div>
          <a-select
            v-model="selectedChatModelId"
            class="chat-test-model-select"
            :loading="chatModelsLoading"
            :placeholder="$t('aice.aiproxy.client_model_select')"
            @change="onChatModelChange">
            <a-select-option
              v-for="opt in chatModelOptions"
              :key="opt.id"
              :value="opt.id">
              {{ opt.id }}
            </a-select-option>
          </a-select>
        </div>
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(message, index) in messages"
        :key="index"
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
          <div v-else-if="message.content" class="message-text message-text-stream">
            <!-- 流式阶段用纯文本；白空格保留真实换行，但不强制断词 -->
            <div
              v-if="loading && index === streamingMessageIndex"
              class="stream-plain">{{ message.content }}</div>
            <vue-markdown v-else :source="getMessageContent(message.content)" />
          </div>
          <div class="message-time">{{ $moment(message.time).format('YYYY-MM-DD HH:mm:ss') }}</div>
        </div>
      </div>
      <div v-if="showThinking" class="message-item assistant">
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
        :placeholder="chatTestInputPlaceholder"
        :auto-size="{ minRows: 2, maxRows: 6 }"
        @keydown.ctrl.enter="handleSend"
        @keydown.meta.enter="handleSend"
        :disabled="loading" />
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
  buildAnthropicChatTestRequestConfig,
  buildChatTestRequestConfig,
  isPlaceholderApiKey,
  resolveAiproxyAnthropicMessagesUrl,
  resolveAiproxyChatCompletionsUrl,
} from '@Ai/utils/aiproxyEndpoint'
import {
  appendAnthropicStreamLine,
  extractAnthropicResponseText,
} from '@Ai/utils/anthropicStream'
import { splitThinkingContent, normalizeMarkdownTables } from '@Ai/utils/chatContent'
import {
  buildDeploymentClientModelOptions,
  defaultClientModelOption,
  fetchRoutingClientModelOptions,
  mergeClientModelOptions,
} from '@Ai/utils/aiproxyClientModelId'

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
    initialChatModel: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      messages: [],
      inputMessage: '',
      loading: false,
      streamingMessageIndex: -1,
      mcpTools: [],
      toolsPopoverVisible: false,
      selectedVirtualKeyId: '',
      selectedVirtualKey: '',
      virtualKeyExtraOpts: [],
      endpointUrl: '',
      endpointLoading: false,
      virtualKeyLoading: false,
      chatTestConfig: null,
      chatProtocol: 'openai',
      anthropicStreamState: {},
      abortController: null,
      expandedReasoningMap: {},
      chatTestGreetingShown: false,
      selectedChatModelId: '',
      chatModelOptions: [],
      chatModelsLoading: false,
    }
  },
  computed: {
    isMcpResource () {
      return this.mode === 'mcpResource'
    },
    isChatTest () {
      return this.mode === 'chatTest'
    },
    // 已有增量内容时不再盖「思考中」，否则用户会感觉整段一次性返回
    showThinking () {
      if (!this.loading) return false
      if (this.streamingMessageIndex < 0) return true
      const msg = this.messages[this.streamingMessageIndex]
      return !(msg && msg.content)
    },
    canSend () {
      if (this.isChatTest) return !!this.chatTestConfig
      return true
    },
    chatTestInputPlaceholder () {
      if (!this.isChatTest || this.canSend) {
        return this.$t('ai.mcp.input_placeholder')
      }
      return this.chatTestConfigMissingReason || this.$t('ai.mcp.chat_test.api_key_required')
    },
    chatTestConfigMissingReason () {
      if (!this.isChatTest || this.canSend) return ''
      if (!this.selectedVirtualKeyId) {
        return this.$t('aice.llm_deployment.chat_test_select_vk')
      }
      if (this.virtualKeyLoading || this.endpointLoading) {
        return this.$t('common.loading')
      }
      if (!this.selectedVirtualKey) {
        return this.$t('ai.mcp.chat_test.api_key_required')
      }
      if (!this.getChatTestModel()) {
        return this.$t('aice.aiproxy.routing_model_key_required')
      }
      if (!this.endpointUrl) {
        return this.$t('ai.mcp.chat_test.config_required')
      }
      return this.$t('ai.mcp.chat_test.api_key_required')
    },
    virtualKeySelectParams () {
      return getAiproxySelectParams(this, 'ai_virtual_keys', { enabled: true, limit: 100 })
    },
    virtualKeySelectProps () {
      return {
        placeholder: this.$t('aice.llm_deployment.chat_test_select_vk'),
        allowClear: true,
      }
    },
    chatProtocolOptions () {
      return [
        { value: 'openai', label: this.$t('aice.aiproxy.protocol.openai') },
        { value: 'anthropic', label: this.$t('aice.aiproxy.protocol.anthropic') },
      ]
    },
    showChatModelSelect () {
      return this.chatModelOptions.length > 0
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
    initialChatModel (val) {
      if (this.isChatTest && val) {
        this.applyChatTestModelSelection()
        this.applyChatTestConfig()
      }
    },
    selectedChatModelId () {
      if (this.isChatTest) {
        this.applyChatTestConfig()
      }
    },
    'data.aiproxy_routing_id' () {
      if (this.isChatTest) {
        this.loadChatTestEndpoint()
        this.loadChatTestModels()
      }
    },
    'data.id' () {
      if (this.isChatTest && !this.data?.aiproxy_routing_id) {
        this.loadChatTestEndpoint()
        this.loadChatTestModels()
      }
    },
    'data.model_key' () {
      if (this.isChatTest) {
        this.loadChatTestModels()
      }
    },
    'data.aiproxy_bindings' () {
      if (this.isChatTest) {
        this.loadChatTestModels()
      }
    },
    endpointUrl () {
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
      this.loadChatTestModels()
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
    // initChatTestGreetingMessage () {
    //   if (!this.isChatTest || this.chatTestGreetingShown || !this.chatTestConfig) return
    //   const greetingText = this.$t('ai.mcp.greeting')
    //   const hasGreeting = this.messages.some(
    //     item => item.role === 'assistant' && item.content === greetingText,
    //   )
    //   this.chatTestGreetingShown = true
    //   if (hasGreeting) return
    //   this.initGreetingMessage()
    // },
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
      if (this.isChatTest && !this.canSend) {
        this.$message.warning(this.chatTestConfigMissingReason || this.$t('ai.mcp.chat_test.api_key_required'))
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
      this.streamingMessageIndex = assistantMessageIndex
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
        this.streamingMessageIndex = -1
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

      // 与 chatTest 共用按行解析，支持后端 token 级增量 SSE（data: xxx\n\n）
      await this.consumeStreamResponse(response, assistantMessageIndex, 'mcp')
    },
    async streamChatTestResponse (message, assistantMessageIndex, history = []) {
      const { url, headers, body: bodyTemplate, protocol = 'openai' } = this.chatTestConfig
      const messages = [
        ...history.map(item => ({ role: item.role, content: item.content })),
        { role: message.role, content: message.content },
      ]
      const requestBody = {
        ...bodyTemplate,
        messages,
        stream: true,
      }

      this.anthropicStreamState = {}

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

      const streamFormat = protocol === 'anthropic' ? 'anthropic' : 'openai'
      await this.consumeStreamResponse(response, assistantMessageIndex, streamFormat)
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

          if (format === 'mcp') {
            // 按 SSE 事件（\n\n）解析；同一事件内多个 data: 行用 \n 拼接
            const events = buffer.split('\n\n')
            buffer = events.pop() || ''
            for (const event of events) {
              this.appendMcpSseEvent(event, assistantMessageIndex)
            }
          } else {
            const chunks = buffer.split('\n')
            buffer = chunks.pop() || ''
            for (const line of chunks) {
              this.appendStreamLine(line, assistantMessageIndex, format)
            }
          }

          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }

        if (buffer.trim()) {
          if (format === 'mcp') {
            this.appendMcpSseEvent(buffer, assistantMessageIndex)
          } else {
            this.appendStreamLine(buffer, assistantMessageIndex, format)
          }
        }
      } else {
        const text = await response.text()
        try {
          const data = JSON.parse(text)
          let raw = ''
          if (format === 'anthropic') {
            raw = extractAnthropicResponseText(data)
          } else {
            raw = this.extractOpenAiContent(data) || data.content || data.text || data.message || text
          }
          if (format === 'openai' || format === 'anthropic') {
            this.applyChatTestContent(assistantMessageIndex, raw)
          } else {
            this.$set(this.messages[assistantMessageIndex], 'content', raw)
          }
        } catch (e) {
          if (format === 'openai' || format === 'anthropic') {
            this.applyChatTestContent(assistantMessageIndex, text)
          } else {
            this.$set(this.messages[assistantMessageIndex], 'content', text)
          }
        }
      }
    },
    appendMcpSseEvent (event, assistantMessageIndex) {
      if (!event || !event.trim()) return
      const dataLines = event.split('\n').filter(line => line.startsWith('data:'))
      if (!dataLines.length) return // 忽略 : comment 等
      const payload = dataLines.map(line => {
        let p = line.slice(5)
        if (p.startsWith(' ')) p = p.slice(1)
        return p
      }).join('\n')
      const newContent = (this.messages[assistantMessageIndex].content || '') + payload
      this.$set(this.messages[assistantMessageIndex], 'content', newContent)
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    appendStreamLine (line, assistantMessageIndex, format) {
      if (format === 'openai') {
        this.appendOpenAiStreamLine(line, assistantMessageIndex)
        return
      }
      if (format === 'anthropic') {
        this.appendAnthropicStreamLine(line, assistantMessageIndex)
        return
      }
      // 非 mcp 兜底：按单行 data: 追加
      if (!line.startsWith('data:')) return
      let payload = line.slice(5)
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
    appendAnthropicStreamLine (line, assistantMessageIndex) {
      const { delta, state } = appendAnthropicStreamLine(line, this.anthropicStreamState)
      this.anthropicStreamState = state
      if (delta) {
        this.appendChatTestDelta(assistantMessageIndex, delta)
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
    getChatTestReadyBindings () {
      const bindings = Array.isArray(this.data?.aiproxy_bindings) ? this.data.aiproxy_bindings : []
      return bindings.filter(item => {
        if (!item?.client_model_alias) return false
        return item.sync_status === 'synced' || !item.sync_status
      })
    },
    getLegacyChatTestModel () {
      const modelKey = String(this.data?.model_key || '').trim()
      if (modelKey) return modelKey
      return this.getChatTestReadyBindings()[0]?.client_model_alias || ''
    },
    getChatTestModel () {
      const selected = String(this.selectedChatModelId || '').trim()
      if (selected) return selected
      return this.getLegacyChatTestModel()
    },
    applyChatTestModelSelection (reset = false) {
      const initial = String(this.initialChatModel || '').trim()
      if (initial && this.chatModelOptions.some(opt => opt.id === initial)) {
        this.selectedChatModelId = initial
        return
      }
      if (!reset && this.selectedChatModelId && this.chatModelOptions.some(opt => opt.id === this.selectedChatModelId)) {
        return
      }
      const modelKey = String(this.data?.model_key || '').trim()
      if (modelKey && this.chatModelOptions.some(opt => opt.id === modelKey)) {
        this.selectedChatModelId = modelKey
        return
      }
      const fromOptions = defaultClientModelOption(this.chatModelOptions)
      if (fromOptions) {
        this.selectedChatModelId = fromOptions
        return
      }
      this.selectedChatModelId = this.getLegacyChatTestModel()
    },
    async loadChatTestModels () {
      if (!this.isChatTest) return
      this.chatModelsLoading = true
      try {
        const bindings = Array.isArray(this.data?.aiproxy_bindings) ? this.data.aiproxy_bindings : []
        let options = []
        if (bindings.length) {
          const deploymentOptions = buildDeploymentClientModelOptions(this.getChatTestReadyBindings())
          const routingId = String(this.data?.aiproxy_routing_id || '').trim()
          let routingOptions = []
          if (routingId) {
            const result = await fetchRoutingClientModelOptions(routingId, {}, this)
            routingOptions = result.options || []
          }
          options = mergeClientModelOptions(deploymentOptions, routingOptions)
        } else {
          const routingId = this.getChatTestRoutingId()
          const result = await fetchRoutingClientModelOptions(routingId, this.data, this)
          options = result.options || []
        }
        this.chatModelOptions = options
        this.applyChatTestModelSelection()
      } catch (e) {
        const fallback = buildDeploymentClientModelOptions(this.getChatTestReadyBindings())
        this.chatModelOptions = fallback
        this.applyChatTestModelSelection(true)
      } finally {
        this.chatModelsLoading = false
        this.applyChatTestConfig()
      }
    },
    onChatModelChange () {
      this.applyChatTestConfig()
    },
    getChatTestRoutingId () {
      return this.data?.aiproxy_routing_id || this.data?.id || ''
    },
    async loadChatTestEndpoint () {
      this.endpointLoading = true
      try {
        const routingId = this.getChatTestRoutingId()
        if (this.chatProtocol === 'anthropic') {
          this.endpointUrl = await resolveAiproxyAnthropicMessagesUrl(this, { routingId })
        } else {
          this.endpointUrl = await resolveAiproxyChatCompletionsUrl(this, { routingId })
        }
      } catch (e) {
        this.endpointUrl = ''
      } finally {
        this.endpointLoading = false
        this.applyChatTestConfig()
      }
    },
    onChatProtocolChange () {
      this.loadChatTestEndpoint()
    },
    onVirtualKeySelectChange (id) {
      this.onVirtualKeyChange(id)
    },
    onVirtualKeyItemSelected (item) {
      if (!this.isChatTest || !item?.id) return
      if (item.name) {
        this.virtualKeyExtraOpts = [{ id: item.id, name: item.name }]
      }
      if (item.virtual_key) {
        this.selectedVirtualKey = item.virtual_key
        this.applyChatTestConfig()
      }
    },
    resolveVirtualKeyId (id) {
      if (!id) return ''
      if (typeof id === 'object') {
        return String(id.key || id.id || '').trim()
      }
      return String(id).trim()
    },
    async onVirtualKeyChange (id) {
      const virtualKeyId = this.resolveVirtualKeyId(id)
      if (!virtualKeyId) {
        this.selectedVirtualKey = ''
        this.virtualKeyExtraOpts = []
        this.applyChatTestConfig()
        return
      }
      if (
        this.selectedVirtualKey &&
        !isPlaceholderApiKey(`Bearer ${this.selectedVirtualKey}`) &&
        this.resolveVirtualKeyId(this.selectedVirtualKeyId) === virtualKeyId
      ) {
        this.applyChatTestConfig()
        return
      }
      await this.fetchVirtualKeySecret(virtualKeyId)
    },
    async fetchVirtualKeySecret (id) {
      const virtualKeyId = this.resolveVirtualKeyId(id)
      if (!virtualKeyId) {
        this.selectedVirtualKey = ''
        this.virtualKeyExtraOpts = []
        this.applyChatTestConfig()
        return
      }
      const cachedVirtualKey = this.selectedVirtualKey
      this.virtualKeyLoading = true
      try {
        const manager = new Manager('ai_virtual_keys')
        const { data } = await manager.get({
          id: virtualKeyId,
          params: getAiproxySelectParams(this, 'ai_virtual_keys'),
        })
        this.selectedVirtualKey = data?.virtual_key || cachedVirtualKey || ''
        if (data?.id && data?.name) {
          this.virtualKeyExtraOpts = [{
            id: data.id,
            name: data.name,
          }]
        }
      } catch (e) {
        if (!cachedVirtualKey) {
          this.selectedVirtualKey = ''
          this.virtualKeyExtraOpts = []
        }
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
      const builder = this.chatProtocol === 'anthropic'
        ? buildAnthropicChatTestRequestConfig
        : buildChatTestRequestConfig
      const config = builder({
        endpoint: this.endpointUrl,
        model,
        virtualKey: this.selectedVirtualKey,
      })
      this.chatTestConfig = config || null
    },
    async applyInitialVirtualKey (virtualKeyId, virtualKey = '') {
      const id = this.resolveVirtualKeyId(virtualKeyId)
      if (!id) return
      this.selectedVirtualKeyId = id
      if (virtualKey) {
        this.selectedVirtualKey = virtualKey
      }
      if (!virtualKey) {
        await this.fetchVirtualKeySecret(id)
        return
      }
      this.applyChatTestConfig()
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
      this.anthropicStreamState = {}
      this.chatTestGreetingShown = false
      // if (this.isChatTest && this.chatTestConfig) {
      //   this.initChatTestGreetingMessage()
      // }
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
      const normalized = String(content)
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
      return normalizeMarkdownTables(normalized.replace(/\n+$/, '').replace(/[ \t]+$/, ''))
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
    max-width: 760px;
    margin-left: 16px;
    display: flex;
    gap: 8px;
    align-items: flex-end;
    flex-wrap: wrap;

    .chat-test-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .chat-test-field-grow {
      flex: 1;
      min-width: 180px;

      .chat-test-vk-select {
        width: 100%;
        min-width: 0;
      }
    }

    .chat-test-field-label {
      font-size: 12px;
      color: var(--color-text-2, rgba(0, 0, 0, 0.65));
      white-space: nowrap;
      line-height: 1.2;
    }

    .chat-test-protocol-select {
      width: 160px;
      flex-shrink: 0;
    }

    .chat-test-vk-select {
      width: 180px;
    }

    .chat-test-model-select {
      width: 220px;
      flex-shrink: 0;
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
        overflow-wrap: anywhere;
        word-break: normal;

        .stream-plain {
          margin: 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: normal;
          font-family: inherit;
          font-size: inherit;
        }

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
          overflow-x: auto;
          display: block;
          border: 1px solid #e8e8e8;
          border-radius: 4px;
          background: #fff;
          font-size: 13px;
          line-height: 1.5;

          th,
          td {
            border: 1px solid #e8e8e8;
            padding: 8px 12px;
            text-align: left;
            white-space: nowrap;
            vertical-align: top;
          }

          th {
            background: #fafafa;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.85);
          }

          tr:nth-child(even) td {
            background: #fcfcfc;
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
