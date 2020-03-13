import Vue from 'vue'
import marked from 'marked'

const filters = {
  marked,
}

Object.entries(filters).forEach(([key, handler]) => Vue.filter(key, handler))
