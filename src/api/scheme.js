import request from '/src/utils/request'
import { getToken, getLang } from '/src/utils/auth'
import { config_dataset } from '/src/utils/settings'

const schemeUrl = config_dataset.backend_prefix + 'schema/'

export async function getAdminSchema() {
  return await new Promise((resolve, reject) => {
    if (!getToken()) {
      console.error('getAdminSchema error: getToken is empty')
      return
    }

    request({
      url: schemeUrl,
      method: 'get',
      headers: {
        'Accept-Language': getLang(),
      },
      timeout: config_dataset.api_timeout_ms,
    }).then(response => {
      resolve(new AdminSchema(response.data))
    }).catch(error => {
      reject(error)
    })
  })
}

export function categoryUrl(group_slug, category_slug) {
  return `/${group_slug}/${category_slug}/`
}

export function detailUrl(group_slug, category_slug, pk) {
  return `/${group_slug}/${category_slug}/${pk}/`
}

export class CategorySchema {
  constructor(schema, group_slug, category_slug) {
    this.schema = schema
    this.group_slug = group_slug
    this.category_slug = category_slug
  }

  get type() {
    return this.schema['type']
  }

  get group() {
    return this.group_slug
  }

  get category() {
    return this.category_slug
  }

  get title() {
    return this.schema['title']
  }

  getTableInfo() {
    return this.schema['table_info']
  }

  getGraphInfo() {
    return this.schema['graph_info']
  }
}

export class AdminSchema {
  constructor(schema) {
    this.schema = schema
  }

  get_category(group_slug, category_slug) {
    const group = this.schema.groups[group_slug]
    if (!group) {
      return
    }
    const category = group.categories[category_slug]
    if (category) {
      return new CategorySchema(category, group_slug, category_slug)
    }
  }

  get_groups() {
    return this.schema.groups
  }
}
