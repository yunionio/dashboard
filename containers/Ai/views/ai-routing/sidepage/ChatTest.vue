<template>
  <ai-chat
    mode="chatTest"
    :data="data"
    :res-id="resId"
    :initial-virtual-key-id="initialVirtualKeyId"
    :initial-virtual-key="initialVirtualKey"
    :initial-chat-model="initialChatModel" />
</template>

<script>
import AiChat from '@Ai/sections/Chat'

export default {
  name: 'AiRoutingChatTest',
  components: {
    AiChat,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    resId: {
      type: String,
      required: true,
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
}
</script>
