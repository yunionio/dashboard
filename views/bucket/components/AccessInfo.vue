<template>
  <a-popover :title="$t('storage.text_91')" trigger="hover" placement="top" @visibleChange="handleVisibleChange">
    <div slot="content" class="access-info-content">
      <a-spin :spinning="loading" />
      <template v-if="!loading">
        <a-row v-for="(value, key) in infoData" :key="key" class="pb-2">
          <a-col :span="7">
            {{key}}：
          </a-col>
          <a-col :span="16" style="word-break:break-all;">
            {{value}}
            <copy :message="value" />
          </a-col>
        </a-row>
      </template>
    </div>
    <a><a-icon style="font-size: 18px" type="tool" /></a>
  </a-popover>
</template>

<script>
export default {
  name: 'BucketAccessInfo',
  props: {
    row: {
      type: Object,
    },
  },
  data () {
    return {
      loading: false,
      infoData: {},
    }
  },
  methods: {
    handleVisibleChange (v) {
      if (v) {
        this.fetchAccessInfo()
      }
    },
    async fetchAccessInfo (row = this.row) {
      const manager = new this.$Manager('buckets')
      try {
        this.loading = true
        const { data } = await manager.getSpecific({
          id: row.id,
          spec: 'access-info',
        })
        this.infoData = data
        this.loading = false
      } catch (err) {
        this.loading = false
        throw err
      }
    },
  },
}
</script>

<style lang="scss" scoped>
  .access-info-content {
    max-height: 300px;
    width: 700px;
    overflow-y:auto;
  }
</style>>
