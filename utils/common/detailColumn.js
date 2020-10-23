import * as R from 'ramda'
import _ from 'lodash'
import { isUserTag, isExtTag } from './tag'
import i18n from '@/locales'
import TagDetailColumn from '@/sections/TagDetailColumn'

const getTagColumn = ({
  showEdit = false,
  type = 'user',
  field = 'user_tag',
  title = i18n.t('table.title.user_tag'),
  ignoreKeys,
  needExt,
  needUser,
  resource,
  onManager,
  columns,
  tipName,
  ignorePrefix,
}) => {
  return {
    title,
    field,
    hidden: (data) => {
      if (R.isNil(data.metadata) || R.isEmpty(data.metadata)) {
        return true
      }
      const keys = Object.keys(data.metadata)
      let hasTag = false
      if (type === 'user') {
        hasTag = keys.some(item => isUserTag(item))
      }
      if (type === 'ext') {
        hasTag = keys.some(item => isExtTag(item))
      }
      return !hasTag
    },
    slots: {
      default: ({ row }, h) => {
        return [
          h(TagDetailColumn, {
            props: {
              showEdit,
              type,
              row,
              onManager,
              metadata: _.get(row, 'metadata', {}),
              ignoreKeys,
              needExt,
              needUser,
              resource,
              columns,
              tipName,
              ignorePrefix,
            },
          }),
        ]
      },
    },
  }
}

export const getUserTagColumn = ({
  field = 'user_tag',
  title = i18n.t('table.title.user_tag'),
  ignoreKeys,
  needExt,
  needUser,
  resource,
  onManager,
  columns,
  tipName,
  ignorePrefix,
} = {}) => {
  return getTagColumn({
    showEdit: true,
    type: 'user',
    field: field,
    title: title,
    ignoreKeys,
    needExt,
    needUser,
    resource,
    onManager,
    columns,
    tipName,
    ignorePrefix,
  })
}

export const getExtTagColumn = ({
  field = 'ext_tag',
  title = i18n.t('table.title.ext_tag'),
  ignoreKeys,
  needExt,
  needUser,
  resource,
  onManager,
  columns,
  tipName,
  ignorePrefix,
} = {}) => {
  return getTagColumn({
    type: 'ext',
    field: field,
    title: title,
    ignoreKeys,
    needExt,
    needUser,
    resource,
    onManager,
    columns,
    tipName,
    ignorePrefix,
  })
}
