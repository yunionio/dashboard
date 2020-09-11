<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('storage.text_91') }}</div>
    <div slot="body">
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
    <div slot="footer">
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BucketAccessInfoDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      infoData: {},
    }
  },
  created () {
    this.fetchAccessInfo()
  },
  methods: {
    async fetchAccessInfo () {
      const manager = new this.$Manager('buckets')
      try {
        this.loading = true
        const { data } = await manager.getSpecific({
          id: this.params.data[0].id,
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
