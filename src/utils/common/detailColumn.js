import * as R from 'ramda'
import _ from 'lodash'
import i18n from '@/locales'
import TagDetailColumn from '@/sections/TagDetailColumn'
import { isExtTag } from './tag'

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
  hidden,
  editCheck = (row) => true,
}) => {
  return {
    title,
    field,
    hidden,
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
              canEdit: editCheck(row),
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
  showEdit = true,
  editCheck = (row) => true,
} = {}) => {
  return getTagColumn({
    showEdit,
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
    editCheck,
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
  editCheck = (row) => true,
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
    hidden: (data) => {
      if (R.isNil(data.metadata) || R.isEmpty(data.metadata)) {
        return true
      }
      const keys = Object.keys(data.metadata)
      const hasTag = keys.some(item => isExtTag(item))
      return !hasTag
    },
    editCheck,
  })
}
