<template>
  <div>
    <a-icon type="loading" v-if="loading" />
    <div v-else-if="content && content.length">
      <div v-for="(obj, i) in content" :key="i">
        <a-tag class="mb-1 d-block text-truncate" type="info" size="mini" :title="obj">{{ obj }}</a-tag>
      </div>
    </div>
    <div v-else-if="showUnused">
      <a-icon type="bulb" theme="twoTone" twoToneColor="#f5222d" class="mr-1" />
      <span>{{$t('network.text_245')}}</span>
    </div>
    <div class="error-color" v-else-if="errorText">
      <span>{{ errorText }}</span>
      <a-icon type="sync" :spin="loading" @click="fetchData" :style="{ color: '#1890ff' }" />
    </div>
    <div v-else>-</div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'

export default {
  name: 'LbListCell',
  props: {
    params: {
      type: Object,
      required: true,
    },
    manager: {
      type: Object,
      required: true,
    },
    format: {
      type: Function,
      required: true,
    },
    status: {
      type: String,
    },
    type: {
      type: String,
      validator: val => !val || ['lb', 'lbBackendGroup'].includes(val),
    },
  },
  data () {
    return {
      loading: false,
      content: [],
      showUnused: false,
    }
  },
  watch: {
    params () {
      this.fetchData()
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      const values = Object.values(this.params).filter(val => !!val)
      if (R.isNil(values) || R.isEmpty(values)) return
      if (this.status === 'deleting' || this.status === 'deleted') return
      this.loading = true
      this.showUnused = false
      const params = { ...this.params, $t: uuid() }
      const { data: { data = [] } } = await this.manager.list({ params })
      try {
        if (!data.length && this.type === 'lb') {
          this.showUnused = true
        }
        const content = data.map(item => this.format(item)).filter(v => !!v)
        this.loading = false
        this.errorText = ''
        this.content = content
      } catch (error) {
        this.showUnused = false
        if (error.response.status === 404) {
          this.errorText = this.$t('network.text_246')
        } else {
          this.errorText = this.$t('network.text_247')
        }
        this.loading = false
      }
    },
  },
}
</script>
