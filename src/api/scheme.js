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

class AdminSchema {
  constructor(schema) {
    this.schema = schema
  }

  get_category(group_slug, category_slug) {
    const group = this.schema.groups[group_slug]
    if (!group) {
      return
    }
    return group.categories[category_slug]
  }

  get_groups() {
    return this.schema.groups
  }
}
