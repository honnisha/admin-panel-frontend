<template>
  <div class="list-page">

    <div class="list-above-block">
      <div class="header-row-filters">
        <Filters
          :category-schema="categorySchema"
          :filter-info-init="filterInfo"
          @filtered="handleFilter"
          :loading="listLoading"
        />
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
      :show-select="isShowSelect()"

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


    <div class="table-bottom">

      <div class="table-bottom-cell" v-if="hasActons()">
        <v-label class="info">{{ $t('selected') }} <p class="selected-count">{{ getSelectedCount()}}/{{ getTotalCount() }}</p></v-label>
      </div>

      <div class="table-bottom-cell actions-cell">
        <template
          v-for="(action_info, key) in categorySchema.getTableInfo().actions"
          v-bind:key="key"
        >
          <v-btn
            size="small"
            class="action-button"
            :variant="action_info.variant || 'flat'"
            :prepend-icon="action_info.icon"
            :base-color="action_info.base_color || 'secondary'"
            @click="pressAction(action_info, key)"
          >
            {{ action_info.name }}
          </v-btn>
        </template>
      </div>

      <div class="table-bottom-cell">

        <v-tooltip location="start" :text="$t('itemsPerPage')">
          <template v-slot:activator="{ props }">
            <div v-bind="props">
              <v-select
                class="list-pagination-per-page"
                v-model="pageInfo.limit"
                :items="perPageOptions"
                @update:modelValue="value => {this.pageInfo.page = 1; changePagination(value)}"
              ></v-select>
            </div>
          </template>
        </v-tooltip>

        <v-label class="info">{{ getTotalCount() }}</v-label>

        <v-pagination
          class="list-pagination"
          v-model="pageInfo.page"
          :length="getPagesLength()"
          :total-visible="5"
          size="40"
          @update:modelValue="value => changePagination(value)"
        ></v-pagination>
      </div>

    </div>

  </div>
</template>

<script>
import { CategorySchema } from '/src/api/scheme'
import { getSettings, setSettings } from '/src/utils/settings'
import { getDataList } from '/src/api/table'
import { toast } from "vue3-toastify"

export default {
  props: {
    group: {type: String, required: true},
    category: {type: String, required: true},

    categorySchema: {type: CategorySchema, required: true},
  },
  data() {
    return {
      loading: false,
      filters: {},
      pageData: {},
      pageInfo: {},
      headers: {},
      selected: [],
      filterInfo: {
        search: null,
        filters: {},
      },
    }
  },
  created() {
    this.headers = this.getHeaders()

    this.pageInfo = {
      page: 1,
      limit: getSettings().page_size || 25,
    }

    this.deserializeQuery()
    this.getListData()
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
        headerData['sortable'] = tableInfo.ordering_fields.indexOf(slug) >= 0
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
    handleClick(index, row) {
      if (index == 0 && this.canRetrieve()) {
        const pkValue = row[this.sectionData.meta.pk_name]

        if (!this.sectionData.meta.pk_name || !pkValue) {
          console.error(`PK value "${this.sectionData.meta.pk_name}" not found in row:`, row)
          return
        }

        const edit_url = `/${this.sectionData.group}/${this.viewname}/${pkValue}/update`
        this.$router.push({ path: edit_url } )
      }
    },
    deserializeQuery() {
      // Change url params only if group presented
      if (!this.group) return

      const page = this.$route.query.page
      if (page) this.pageInfo.page = parseInt(page)
      const limit = this.$route.query.limit
      if (limit) this.pageInfo.limit = parseInt(limit)

      const ordering = this.$route.query.ordering
      if (ordering) this.ordering = ordering

      // Deserialize filters
      if (this.$route.query.filters) {
        this.filterInfo = JSON.parse(decodeURIComponent(this.$route.query.filters))
      }
    },
    serializeQuery() {
      // Change url params only if group presented
      if (!this.group) return

      let newQuery = {}
      if (this.pageInfo.page) newQuery.page = this.pageInfo.page
      if (this.pageInfo.limit) newQuery.limit = this.pageInfo.limit

      if (this.ordering) newQuery.ordering = this.ordering

      // Serialize filters
      if (Object.keys(this.filterInfo).length > 0) {
        newQuery.filters = encodeURIComponent(JSON.stringify(this.filterInfo))
      }

      this.$router.push({name: this.$route.name, query: newQuery})
    },
    async getListData() {
      this.loading = true
      getDataList({
        pageInfo: this.pageInfo,
        filters: this.filterInfo,
        ordering: this.ordering,

        group: this.group,
        category: this.category,

        relationNameFilter: this.relationNameFilter,
        filterId: this.filterId,
      }).then(responseData => {
        this.pageData = responseData
        this.loading = false
      }).catch(error => {
        this.listLoading = false
        console.error('Get list error:' + error)
        toast(`Error: ${error}`, {
          "limit": 3, "theme": "auto", "type": "warning", "position": "top-center",
        })
      })
    },
    handleFilter(newFilterInfo) {
      this.pageInfo.page = 1
      this.filterInfo = newFilterInfo
      this.serializeQuery()
      this.getListData()
    },
    hasActons() {
      if (!this.categorySchema.getTableInfo().actions) {
        return false
      }
      return Object.keys(this.categorySchema.getTableInfo().actions).length > 0
    },
    isShowSelect() {
      return this.hasActons()
    },
    changePagination() {
      let settings = getSettings()
      settings.page_size = this.pageInfo.limit
      setSettings(settings)

      this.selected = []
      this.serializeQuery()
      this.getListData()
    },
    getPagesLength() {
      return Math.ceil((this.pageData.count || 0) / this.pageInfo.limit)
    },
  },
}
</script>
