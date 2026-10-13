import storage from '@/utils/storage'

/**
 * 组织架构树构建（管理页与资源列表侧栏共用）
 */

export const ORG_SIDEBAR_WIDTH_KEY = '__oc_organization_sidebar_width__'
export const DEFAULT_ORG_SIDEBAR_WIDTH = 260
export const MIN_ORG_SIDEBAR_WIDTH = 180
export const MAX_ORG_SIDEBAR_WIDTH = 480

export function clampOrgSidebarWidth (width) {
  const next = Number(width)
  if (!Number.isFinite(next)) return DEFAULT_ORG_SIDEBAR_WIDTH
  return Math.min(MAX_ORG_SIDEBAR_WIDTH, Math.max(MIN_ORG_SIDEBAR_WIDTH, next))
}

export function getStoredOrgSidebarWidth () {
  return clampOrgSidebarWidth(storage.get(ORG_SIDEBAR_WIDTH_KEY, DEFAULT_ORG_SIDEBAR_WIDTH))
}

export function setStoredOrgSidebarWidth (width) {
  const next = clampOrgSidebarWidth(width)
  storage.set(ORG_SIDEBAR_WIDTH_KEY, next)
  return next
}

export function normalizeOrgNodeLabels (nodeList = []) {
  nodeList.forEach(item => {
    if (item.tags) {
      item.full_label = item.tags.map(tag => tag.value).join('^^')
    } else if (item.full_label && item.full_label.includes('\\/')) {
      item.full_label = item.full_label.replace(/\\\//g, '^^')
      item.name = item.name.replace(/\\\//g, '^^')
    }
  })
  return nodeList
}

export function createOrgTreeNode (node, { organization, isLeaf }) {
  const fullLabelList = (node.full_label || node.name).split('^^')
  const [first, ...last] = (node.full_label || node.name).split('^^').reverse()
  const parentFullLabel = first && !last.length ? organization.name : last.reverse().join('^^')
  const parentLabel = fullLabelList.length === 1
    ? organization.name
    : fullLabelList[fullLabelList.length - 2]
  const isLastLevel = Number(node.level) >= Number(organization.level)
  const lastTag = (node.tags && node.tags[node.tags.length - 1]) || {}
  const ret = {
    key: node.id,
    id: node.id,
    fullLabel: node.full_label,
    parentFullLabel,
    parentLabel,
    tag: lastTag.key && lastTag.value ? `${lastTag.key}:${lastTag.value}` : node.name,
    tagKey: lastTag.key || '',
    tagValue: lastTag.value || node.name,
    keyValue: `${lastTag.key || ''}:${lastTag.value || node.name},${node.id}`,
    isLeaf,
    isLastLevel,
    weight: node.weight || 1,
    description: node.description,
    level: node.level,
    tags: node.tags || [],
    name: node.name,
  }
  if (!isLeaf) ret.children = []
  return ret
}

function addNodeToTree (tree, node) {
  if (tree.fullLabel === node.parentFullLabel) {
    if (!tree.children) tree.children = []
    tree.children.push(node)
  } else if (tree.children) {
    tree.children.forEach(item => {
      if (node.parentFullLabel.includes(item.fullLabel)) {
        addNodeToTree(item, node)
      }
    })
  }
}

function addFilterKeysToTree (tree, node) {
  if (node.fullLabel.includes(tree.fullLabel) || tree.id === 'root') {
    if (!tree.filterKeys) tree.filterKeys = []
    const { tagValue } = node
    if (tagValue && !tree.filterKeys.includes(tagValue)) {
      tree.filterKeys.push(tagValue)
    }
    if (!node.filterKeys) node.filterKeys = []
    if (tagValue && !node.filterKeys.includes(tagValue)) {
      node.filterKeys.push(tagValue)
    }
    if (tree.children) {
      tree.children.forEach(child => {
        addFilterKeysToTree(child, node)
      })
    }
  }
}

function sortTreeChildsByWeight (tree) {
  if (tree.children && tree.children.length) {
    tree.children.sort((a, b) => b.weight - a.weight)
    tree.children.forEach(item => {
      sortTreeChildsByWeight(item)
    })
  } else {
    tree.isLeaf = true
  }
}

/**
 * @param {Object} organization
 * @param {Array} nodeList
 * @returns {{ tree: Object, flatNodeList: Array }}
 */
export function buildOrgTree ({ organization, nodeList = [] }) {
  const normalized = normalizeOrgNodeLabels(nodeList.slice())
  const tree = {
    fullLabel: organization.name,
    key: 'root',
    id: 'root',
    title: organization.name,
    tag: organization.name,
    keyValue: `${organization.name},root`,
    tagKey: '',
    tagValue: organization.name,
    weight: 1,
    level: 0,
    isLeaf: !normalized.length,
    isLastLevel: false,
    description: organization.description,
    tags: [],
    name: organization.name,
  }
  const flatNodeList = [{ ...tree }]
  const levels = Array.from(new Set(normalized.map(item => item.level)))
  levels.sort()
  levels.forEach((level, index) => {
    const targets = normalized.filter(item => item.level === level)
    targets.forEach(item => {
      const node = createOrgTreeNode(item, {
        organization,
        isLeaf: index === levels.length - 1,
      })
      const {
        fullLabel,
        key,
        tag,
        tagKey,
        tagValue,
        keyValue,
        parentFullLabel,
        isLeaf,
        isLastLevel,
        weight,
        parentLabel,
        description,
        tags,
        name,
        id,
      } = node
      flatNodeList.push({
        fullLabel,
        key,
        id,
        tag,
        tagKey,
        tagValue,
        keyValue,
        parentFullLabel,
        parentLabel,
        isLeaf,
        isLastLevel,
        title: tagValue,
        level,
        tags,
        weight,
        description,
        name,
      })
      addNodeToTree(tree, node)
    })
  })
  flatNodeList.forEach(item => {
    addFilterKeysToTree(tree, item)
  })
  sortTreeChildsByWeight(tree)
  return { tree, flatNodeList }
}

export function deepFilterOrgTree (list = [], searchValue = '') {
  if (!searchValue) return list
  const keyword = searchValue.toLowerCase()
  const cloneList = list.map(item => {
    const ret = { ...item }
    if (item.children) {
      ret.children = [...item.children]
    }
    return ret
  })
  return cloneList.filter(item => {
    if (item.children) {
      item.children = deepFilterOrgTree(item.children, searchValue)
    }
    return item.filterKeys && item.filterKeys.some(key => key.toLowerCase().includes(keyword))
  })
}

/**
 * 将组织节点转为列表 projectTagFilter
 * @param {Object} node
 * @param {String} tagFilterKey project_tags | tags
 */
export function orgNodeToProjectTagFilter (node = {}, tagFilterKey = 'project_tags') {
  return {
    tagFilterKey,
    [tagFilterKey]: node.tags || [],
  }
}
