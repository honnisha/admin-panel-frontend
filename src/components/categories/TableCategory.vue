<template>
  <div class="list-page">

    <div class="list-above-block">
      <div class="header-row-filters">
        Filters
      </div>

      <div class="header-row-actions">
        <div class="table-button">
          Create
        </div>
        <div class="table-button">
          Settings
        </div>
      </div>
    </div>

    <v-data-table
      class="model-table"
      color="primary"

      v-model="selected"
      :items="pageData.data || []"
      :headers="headers"
      :loading="loading"
      :show-select="true"

      :items-per-page="pageInfo.limit"
      :page="pageInfo.page"

      @update:sortBy="updateSortBy"
      @click:row="clickRow"
    >
      <template
        v-for="(header, index) in headers"
        v-slot:[`item.${header.key}`]="{ item }"
        v-bind:key="index"
      >

        <div
          @click="handleClick(index, item)"
          :class="{ 'table-cell': true, 'table-link': index === 0 && canRetrieve() }"
        >

          <template v-if="header._slug === 'primary'">
            <v-tooltip v-if="item[header.key]">
              #{{ item[header.key].pk }}
              <template v-slot:activator="{ props }">
                <v-chip size="small" v-bind="props">{{ item[header.key].text }}</v-chip>
              </template>
            </v-tooltip>
          </template>

          <template v-else-if="header._slug === 'primarymany'">
            <template v-if="item[header.key]">
              <v-chip v-for="tag in item[header.key]" size="small" v-bind:key="tag">{{ tag.text }}</v-chip>
            </template>
          </template>

          <template v-else-if="header._slug === 'boolean'">
            <v-icon color="green-darken-2" icon="mdi-check" size="small" v-if="item[header.key]"/>
            <v-icon color="red-darken-2" icon="mdi-close" size="small" v-else/>
          </template>

          <template v-else-if="header._slug === 'choice'">
            <template v-if="item[header.key] !== null && item[header.key] !== undefined">
              <template v-if="Object.keys(header.field.tag_style || {}).length > 0">
                <v-chip
                  size="small"
                  :color="header.field.tag_style[item[header.key]]"
                >{{ getChoiceTitle(item, header) }}</v-chip>
              </template>
              <template v-else>
                {{ getChoiceTitle(item, header) }}
              </template>
            </template>
          </template>

          <template v-else-if="header._slug === 'datetime'">
            <span class="cell-string">{{ formatDateTime(item[header.key]) }}</span>
          </template>

          <template v-else-if="header._slug === 'image upload' && header.field.list_preview">
            <v-img
              v-if="item[header.key] && item[header.key].url"
              class="image-preview"
              width="100"
              max-height="100"
              cover
              :src="item[header.key].url"
            />
          </template>

          <template v-else-if="header._slug === 'file upload'">
            <span class="cell-string" v-if="item[header.key]">{{ item[header.key].name }}</span>
            <span class="cell-string" v-else>{{ item[header.key] }}</span>
          </template>

          <template v-else>
            <div :class="header._slug" style="display: none" />
            <span class="cell-string">{{ item[header.key] }}</span>
          </template>
        </div>
      </template>

      <template v-slot:bottom></template>

      <template v-slot:header.data-table-select="{ on, props }">
        <v-tooltip :text="`${$t('applyToAllRecords')} ${getTotalCount()}`">
          <template v-slot:activator="{ props }">
            <div v-bind="props" class="select-to-all">
              <v-checkbox
                v-model="actionToAll"
                color="var(--color-darken-2)"
                density="compact"
              />
            </div>
          </template>
        </v-tooltip>
      </template>

    </v-data-table>
    table {{ categorySchema }}
  </div>
</template>

<script>
import { CategorySchema } from '/src/api/scheme'
import { getSettings } from '/src/utils/settings'

export default {
  props: {
    group: {type: String, required: true},
    category: {type: String, required: true},

    categorySchema: {type: CategorySchema, required: true},
  },
  data() {
    return {
      loading: false,
      pageData: {},
      pageInfo: {},
      headers: {},
      selected: [],
    }
  },
  created() {
    this.headers = this.getHeaders()

    this.pageData.data = [{'id': 1}]

    this.pageInfo = {
      page: 1,
      limit: getSettings().page_size || 25,
    }
  },
  methods: {
    getHeaders() {
      let result = []

      const tableInfo = this.categorySchema.getTableInfo()

      for (const [slug, field] of Object.entries(tableInfo.table_schema)) {
        const headerData = field.header || {}
        headerData['key'] = slug
        headerData['_slug'] = field._slug
        headerData['title'] = field.label
        headerData['align'] = headerData['align'] || 'left'
        headerData['sortable'] = tableInfo.ordering_fields.indexOf(name) >= 0
        result.push(headerData)
      }
      return result
    },
    clickRow(event, row) {
      if (event.ctrlKey) {
        if (!this.selected.includes(row.item.id)) {
          this.selected.push(row.item.id)
        } else {
          this.selected.splice(this.selected.indexOf(row.item.id), 1);
        }
      }
    },
    getSelectedCount() {
      if (this.actionToAll) return this.getTotalCount()
      return this.selected ? this.selected.length : 0
    },
    getTotalCount() {
      return this.pageData.count || 0
    },
    canRetrieve() {
      return true
    },
    handleClick() {
      if (index == 0 && this.canRetrieve()) {
        const pkValue = row[this.sectionData.meta.pk_name]

        if (!this.sectionData.meta.pk_name || !pkValue) {
          console.error(`PK value "${this.sectionData.meta.pk_name}" not found in row:`, row)
          return
        }

        const edit_url = `/${this.sectionData.group}/${this.viewname}/${pkValue}/update`
        this.$router.push({ path: edit_url } )
      }
    }
  },
}
</script>
