<template>
  <div class="data-view">
    <div class="data-view-item mt-3" v-for="item in dataList" :key="item.title">
      <div class="data-view-item_title mb-1">{{ item.title }}</div>
      <code-mirror v-model="item.content" :options="cmOptions" />
    </div>
    <a-button class="mt-4" type="primary" v-if="dataList && dataList.length" @click="update" :loading="loading">{{$t('k8s.text_45')}}</a-button>
  </div>
</template>

<script>
import * as R from 'ramda'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/theme/material.css'

export default {
  name: 'K8SDataViewSidepageDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    const dataList = []
    if (R.is(Object, this.data.data)) {
      R.forEachObjIndexed((value, key) => {
        dataList.push({
          title: key,
          content: value,
        })
      }, this.data.data)
    }
    return {
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        name: 'javascript',
        json: true,
        theme: 'material',
        lineWrapping: true,
        mode: 'text/html',
        matchBrackets: true,
      },
      dataList,
      loading: false,
    }
  },
  methods: {
    async update () {
      try {
        const data = {}
        this.dataList.forEach(val => {
          data[val.title] = val.content
        })
        const { name, cluster, namespace } = this.data
        this.loading = true
        await this.onManager('update', {
          id: name,
          managerArgs: {
            data: { data, namespace, cluster },
          },
        })
        this.$message.success(this.$t('k8s.text_46'))
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>

<style lang="less" scoped>
.data-view {
  &::v-deep {
    .CodeMirror {
      height: 600px !important;
    }
  }
}
</style>
