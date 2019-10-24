<template>
  <div v-on="events">
    <span v-if="!hideField" :class="{ 'text-weak': field === 'description' }">{{ row[field] || '-' }}</span>
    <slot />
    <edit
      slot="edit"
      class="ml-1"
      v-if="showEdit"
      @update="update"
      :label="labelCn"
      :formRules="formRules"
      :input-rules="inputRules"
      :visible.sync="editVisible"
      :defaultValue="row[field]" />
    <copy
      slot="copy"
      class="ml-1"
      v-if="showCopy"
      :message="copyMessage" />
  </div>
</template>

<script>
export default {
  name: 'ListBodyCellWrap',
  props: {
    alwaysShowCopyBtn: {
      type: Boolean,
      default: false,
    },
    alwaysShowEditBtn: {
      type: Boolean,
      default: false,
    },
    row: { // 当前行数据
      type: Object,
    },
    message: { // copy 的内容
    },
    field: {
      type: String,
      default: 'name',
    },
    label: {
      type: String,
    },
    steadyStatus: {
      type: Array,
    },
    list: {
      type: Object,
    },
    copy: {
      type: Boolean,
      default: false,
    },
    edit: {
      type: Boolean,
      default: false,
    },
    hideField: {
      type: Boolean,
      default: false,
    },
    formRules: {
      type: Array,
    },
  },
  data () {
    return {
      showBtn: false,
      editVisible: false, // edit form 的显隐
    }
  },
  computed: {
    copyMessage () {
      if (this.message) {
        return this.message
      }
      return this.row[this.field] || '-'
    },
    labelCn () {
      if (this.label) return this.label
      const fieldMap = {
        name: '名称',
        description: '备注',
      }
      if (fieldMap[this.field]) {
        return fieldMap[this.field]
      }
      return ''
    },
    showCopy () {
      if (this.alwaysShowCopyBtn) return true
      if (this.copy && this.showBtn) return true
      return false
    },
    showEdit () {
      if (this.alwaysShowEditBtn) return true
      if (this.editVisible) return true
      if (this.edit && this.showBtn) return true
      return false
    },
    inputRules () {
      if (this.field === 'description') return []
      return null
    },
  },
  created () {
    this.events = {}
    this.events.mouseenter = this.handleMouseenter
    this.events.mouseleave = this.handleMouseleave
  },
  methods: {
    update (formData) {
      const steadyStatus = this.steadyStatus || this.list.steadyStatus
      this.list && this.list.singleUpdate(this.row.id, { [this.field]: formData.input }, steadyStatus)
    },
    handleMouseenter (e) {
      e.stopPropagation()
      e.preventDefault()
      if (!this.showBtn) this.showBtn = true
    },
    handleMouseleave (e) {
      e.stopPropagation()
      e.preventDefault()
      if (this.showBtn) this.showBtn = false
    },
  },
}
</script>
