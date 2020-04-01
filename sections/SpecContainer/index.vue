<template>
  <div>
    <a-tabs hideAdd v-model="active" type="editable-card" @edit="onEdit">
      <a-tab-pane v-for="(pane, i) in panes" :tab="`容器${i + 1}`" :key="pane.key" :closable="panes.length > 1">
        <spec-container-form :decorators="getDecorators(pane)" :cluster="cluster" :namespace="namespace" />
      </a-tab-pane>
      <template v-slot:tabBarExtraContent>
        <a-button type="link" @click="add">添加容器</a-button>
      </template>
    </a-tabs>
  </div>
</template>

<script>
import * as R from 'ramda'
import SpecContainerForm from '@K8S/sections/SpecContainer/Form'
import { uuid } from '@/utils/utils'

export default {
  name: 'K8SSpecContainers',
  components: {
    SpecContainerForm,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    cluster: String,
    namespace: String,
  },
  data () {
    const key = uuid()
    return {
      active: key,
      panes: [
        { key },
      ],
    }
  },
  methods: {
    add () {
      this.panes.push({
        key: uuid(),
      })
    },
    onEdit (targetKey, action) {
      if (action === 'remove') {
        const index = this.panes.findIndex(val => val.key === targetKey)
        if (index === 0) {
          this.active = this.panes[1].key
        }
        this.panes.splice(index, 1)
      }
    },
    getDecorators (val) {
      const ret = {}
      R.forEachObjIndexed((item, key) => {
        if (R.is(Function, item)) {
          ret[key] = item(val.key)
        }
      }, this.decorators)
      return ret
    },
  },
}
</script>
