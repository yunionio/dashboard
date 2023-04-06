<template>
  <div class="d-flex flex-start flex-wrap">
    <div class="mr-1 mb-1" v-for="(tag, index) in tags" :key="tag + index">
      <a-tooltip v-if="tag.length > 20" :title="tag">
        <a-tag closable @close="handleClose(index)">
          {{ `${tag.slice(0, 20)}...` }}
        </a-tag>
      </a-tooltip>
      <a-tag v-else closable @close="handleClose(index)">
        {{ tag }}
      </a-tag>
    </div>
    <div class="mr-1 mb-1" v-if="inputVisible">
      <a-input
        ref="inputRef"
        type="text"
        size="small"
        :style="{ width: '100px' }"
        v-model="inputValue"
        @blur="handleInputConfirm"
        @keyup.enter="handleInputConfirm" />
    </div>
    <div class="mr-1 mb-1" v-else>
      <a-tag @click="showInput" style="background: #fff; border-style: dashed;cursor: pointer;">
        <a-icon type="plus" />{{$t('common.new')}}
      </a-tag>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TagGroup',
  props: {
    value: {
      require: true,
      type: Array,
    },
  },
  data () {
    return {
      tags: this.value,
      inputVisible: false,
      inputValue: '',
    }
  },
  watch: {
    tags: {
      handler: function (val) {
        this.$emit('change', val)
      },
      deep: true,
    },
  },
  methods: {
    handleClose (removedTag) {
      const tags = this.tags.filter((tag, index) => index !== removedTag)
      this.tags = tags
    },
    showInput () {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.inputRef.focus()
      })
    },
    handleInputConfirm () {
      const inputValue = this.inputValue
      let tags = this.tags
      if (inputValue && tags.indexOf(inputValue) === -1) {
        tags = [...tags, inputValue]
      }
      Object.assign(this, {
        tags,
        inputVisible: false,
        inputValue: '',
      })
    },
  },
}
</script>
