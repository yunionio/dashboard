<template>
  <div>
    <a-alert banner :message="$t('common_274', [this.$t('dictionary.project')])" />
    <div class="mt-2 d-flex flex-wrap list">
      <template v-for="item of projects">
        <div
          class="item text-truncate p-2"
          :class="{ active: pid === item.id }"
          :key="item.id"
          @click="() => handleItemClick(item.id)">{{ item.name }}</div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    value: {
      type: String,
    },
  },
  data () {
    return {
      pid: this.value,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    projects () {
      return this.userInfo.projects || []
    },
  },
  created () {
    this.handleItemClick(this.projects[0].id)
  },
  methods: {
    handleItemClick (pid) {
      this.pid = pid
      this.$emit('input', pid)
    },
  },
}
</script>

<style lang="less" scoped>
.list {
  margin: -8px;
}
.item {
  width: 120px;
  cursor: pointer;
  display: block;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
  border-radius: 3px;
  border: 1px solid #eee;
  margin: 8px;
  &.active, &:hover {
    border-color: #4DA1FF;
  }
}
</style>
