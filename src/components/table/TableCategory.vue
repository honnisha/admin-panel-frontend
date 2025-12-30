<template>
  <div class="list-page">

    <div class="list-above-block">
      <div class="header-row-filters">
        <Filters
          v-if="hasFilters()"
          :category-schema="categorySchema"
          :filters-init="filters"
          :search-init="search"
          @filtered="handleFilter"
          :loading="listLoading"

          :search-enabled="getTableInfo().search_enabled"
          :fields-info="getTableInfo().table_filters.fields"
          :search-help="getTableInfo().search_help"
        />
      </div>

      <div class="header-row-actions">
        <div class="table-button" v-if="canCreate()">
          <FormCreate
            v-if="canCreate()"
            :title="categorySchema.title"

            :admin-schema="adminSchema"
            :category-schema="categorySchema"

            @created="createdEvent"
          />
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

          <template v-if="header.type === 'string'">
            {{ stripHtml(item[header.key]) }}
          </template>

          <template v-else-if="header.type === 'related'">
            <v-tooltip v-if="item[header.key]">
              #{{ item[header.key].key }}
              <template v-slot:activator="{ props }">
                <v-chip size="small" v-bind="props">{{ item[header.key].title }}</v-chip>
              </template>
            </v-tooltip>
          </template>

          <template v-else-if="header.type === 'primarymany'">
            <template v-if="item[header.key]">
              <v-chip
                v-for="tag in item[header.key]"
                size="header.field.size || 'small'"
                v-bind:key="tag"
              >{{ tag.text }}</v-chip>
            </template>
          </template>

          <template v-else-if="header.type === 'boolean'">
            <v-icon color="green-darken-2" icon="mdi-check" size="small" v-if="item[header.key]"/>
            <v-icon color="red-darken-2" icon="mdi-close" size="small" v-else/>
          </template>

          <template v-else-if="header.type === 'choice'">
            <template v-if="item[header.key] !== null && item[header.key] !== undefined">
              <template v-if="Object.keys(header.field.tag_colors || {}).length > 0">
                <v-chip
                  class="table-choice-chip"
                  :size="header.field.size || 'small'"
                  :variant="header.field.variant"
                  :color="header.field.tag_colors[getChoiceValue(item, header)]"
                >{{ getChoiceTitle(item, header) }}</v-chip>
              </template>
              <template v-else>
                {{ getChoiceTitle(item, header) }}
              </template>
            </template>
          </template>

          <template v-else-if="header.type === 'datetime'">
            <span class="cell-string">{{ formatDateTime(item[header.key]) }}</span>
          </template>

          <template v-else-if="header.type === 'image'">
            <v-img
              v-if="item[header.key] && item[header.key].url"
              class="image-preview"
              :max-height="header.field.preview_max_height || 100"
              :max-width="header.field.preview_max_width || 100"
              cover
              :src="item[header.key].url"
            />
          </template>

          <template v-else-if="header.type === 'file'">
            <span class="cell-string" v-if="item[header.key]">{{ item[header.key].name }}</span>
            <span class="cell-string" v-else>{{ item[header.key] }}</span>
          </template>

          <template v-else>
            <div :class="header.type" style="display: none" />
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
            :disabled="actionLoading"
          >
            {{ action_info.title }}
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

    <v-dialog v-model="actionDialogConfirmation" max-width="500">
      <v-card :disabled="actionLoading" :loading="actionLoading">

        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ $t('confirmation') }}: {{ getActionInfo().title }}</span>

          <v-btn
            icon="mdi-close"
            variant="text"
            density="compact"
            @click="actionDialogConfirmation = false"
          ></v-btn>
        </v-card-title>

        <v-card-text>
          <div class="confirmation-text">{{ getActionInfo().confirmation_text }}</div>
          <v-label class="info selected-warning-count">{{ $t('selected') }} <p class="selected-count">{{ getSelectedCount()}}/{{ getTotalCount() }}</p></v-label>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn :text="$t('cancel')" variant="elevated" @click="actionDialogConfirmation = false" :disabled="actionLoading"></v-btn>
          <v-btn :text="$t('confirm')" variant="tonal" color="primary" @click="applyAction" :disabled="actionLoading"></v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <v-dialog persistent v-model="actionFormDialogOpen" class="action-form-dialog">
      <v-card :disabled="actionLoading" :loading="actionLoading">

        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ getActionInfo().title }}</span>

          <v-btn
            icon="mdi-close"
            variant="text"
            density="compact"
            @click="actionFormDialogOpen = false"
          ></v-btn>
        </v-card-title>

        <div class="action-description" v-html="getActionInfo().description"></div>

        <FieldsContainer
          ref="fieldscontainer"
          formType="create"
          :table-schema="getActionInfo().form_schema"

          :loading="actionLoading"

          @changed="value => actionFormData = value"
        />

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn :text="$t('cancel')" variant="elevated" @click="actionFormDialogOpen = false" :disabled="actionLoading"></v-btn>
          <v-btn :text="$t('send')" variant="tonal" color="primary" @click="applyAction" :disabled="actionLoading"></v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <v-dialog v-model="persistentMessageDialog" class="persistent-message-dialog">
      <v-card>

        <v-card-text v-html="persistentMessage"></v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :text="$t('close')" variant="elevated" @click="persistentMessageDialog = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import { applyFiltersToQuery, extractFiltersFromQuery } from '/src/utils/filters'
import { CategorySchema, detailUrl } from '/src/api/scheme'
import { getLocalSettings, setLocalSettings } from '/src/utils/settings'
import { getDataList, sendTableAction, downloadContent } from '/src/api/table'
import moment from 'moment'
import { toast } from "vue3-toastify"
import FieldsContainer from '/src/components/table/FieldsContainer.vue'
import FormCreate from '/src/components/table/FormCreate.vue'

export default {
  props: {
    adminSchema: {type: Object, required: true},
    categorySchema: {type: CategorySchema, required: true},
  },
  components: {
    FieldsContainer,
    FormCreate,
  },
  data() {
    return {
      loading: false,
      pageData: {},
      pageInfo: {},
      headers: {},
      selected: [],
      search: null,
      filters: {},
      perPageOptions: [25, 50, 100, 150],

      actionToAll: false,
      actionFormData: null,
      actionDialogConfirmation: false,
      actionFormDialogOpen: false,
      actionSelected: null,
      actionLoading: false,

      persistentMessageDialog: false,
      persistentMessage: null,
    }
  },
  created() {
    this.headers = this.getHeaders()

    this.pageInfo = {
      page: 1,
      limit: getLocalSettings().page_size || 25,
    }

    this.deserializeQuery()
    this.getListData()
  },
  methods: {
    getHeaders() {
      let result = []

      const tableInfo = this.categorySchema.getTableInfo()

      for (const slug of tableInfo.table_schema.list_display) {
        const field = tableInfo.table_schema.fields[slug]
        if (!field) {
          console.error('Table field from listDisplay not found:', slug)
          continue
        }

        const headerData = field.header || {}
        headerData['field'] = field
        headerData['key'] = slug
        headerData['type'] = field.type
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
    hasFilters() {
      const table_filters = this.categorySchema.getTableInfo().table_filters
      return (
        this.categorySchema.getTableInfo().search_enabled ||
        (table_filters && Object.keys(table_filters).length > 0)
      )
    },
    getTotalCount() {
      return this.pageData.total_count || 0
    },
    canCreate() {
      return this.categorySchema.getTableInfo().can_create
    },
    canRetrieve() {
      return this.categorySchema.getTableInfo().can_retrieve
    },
    handleClick(index, row) {
      if (index == 0 && this.canRetrieve()) {
        const pkValue = row[this.categorySchema.getTableInfo().pk_name]

        if (!this.categorySchema.getTableInfo().pk_name || !pkValue) {
          console.error(`PK value "${this.categorySchema.getTableInfo().pk_name}" not found in row:`, row)
          return
        }

        const url = detailUrl(this.categorySchema.group, this.categorySchema.category, pkValue)
        this.$router.push({ path: url } )
      }
    },
    deserializeQuery() {
      // Change url params only if group presented
      if (!this.categorySchema.group) return

      const page = this.$route.query.page
      if (page) this.pageInfo.page = parseInt(page)
      const limit = this.$route.query.limit

      if (limit) {
        let parsed = parseInt(limit)
        this.pageInfo.limit = Math.min(150, Math.max(25, parsed))
      }

      const ordering = this.$route.query.ordering
      if (ordering) this.ordering = ordering

      const search = this.$route.query.search
      if (search) this.search = search

      // Deserialize filters
      const table_filters = this.categorySchema.getTableInfo().table_filters || {}
      this.filters = extractFiltersFromQuery(this.$route, Object.keys(table_filters))
    },
    serializeQuery() {
      // Change url params only if group presented
      if (!this.categorySchema.group) return

      let newQuery = {}
      if (this.pageInfo.page) newQuery.page = this.pageInfo.page
      if (this.pageInfo.limit) newQuery.limit = this.pageInfo.limit

      if (this.ordering) newQuery.ordering = this.ordering
      if (this.search) newQuery.search = this.search

      // Serialize filters
      newQuery = applyFiltersToQuery(newQuery, this.filters)

      this.$router.push({name: this.$route.name, query: newQuery})
    },
    async getListData() {
      this.loading = true
      getDataList({
        pageInfo: this.pageInfo,
        filters: this.filters,
        search: this.search,
        ordering: this.ordering,

        group: this.categorySchema.group,
        category: this.categorySchema.category,
      }).then(responseData => {
        this.pageData = responseData
        this.loading = false
      }).catch(error => {
        this.loading = false
        console.error('Get list error:', error)

        const errorResult = this.$handleError(error)
        if (errorResult.fieldErrors) {
          this.$refs.fieldscontainer.updateErrors(errorResult.fieldErrors)
        }
        if (errorResult.persistentMessage) {
          this.persistentMessageDialog = true
          this.persistentMessage = errorResult.persistentMessage
        }
      })
    },
    handleFilter(filters, search) {
      this.pageInfo.page = 1
      this.filters = filters
      this.search = search
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
      let settings = getLocalSettings()
      settings.page_size = this.pageInfo.limit
      setLocalSettings(settings)

      this.selected = []
      this.serializeQuery()
      this.getListData()
    },
    getPagesLength() {
      return Math.ceil((this.pageData.total_count || 0) / this.pageInfo.limit)
    },
    pressAction(actionInfo, actionKey) {
      if (!actionInfo.allow_empty_selection && !this.actionToAll && this.selected.length === 0) {
        toast(this.$t('actionNotAllowEmptySelection'), {
          "limit": 3, "theme": "auto", "type": "warning", "position": "top-center",
        })
        return
      }

      this.actionFormData = null
      this.actionMeta = null
      this.actionSelected = actionKey

      // Action form
      if (actionInfo.form_schema) {
        this.actionFormDialogOpen = true
      } else {
        // Confirmation window
        if (actionInfo.confirmation_text) {
          this.actionDialogConfirmation = true
        }
        else {
          this.applyAction()
        }
      }
    },
    getActionInfo() {
      return this.categorySchema.getTableInfo().actions[this.actionSelected]
    },
    applyAction() {
      this.actionLoading = true
      sendTableAction({
        group: this.categorySchema.group,
        category: this.categorySchema.category,

        action: this.actionSelected,
        pks: this.selected,
        formData: this.actionFormData || {},
        sendToAll: this.actionToAll,
        filters: this.filters,
        search: this.search,
      }).then(response => {

        if(response.headers['content-type'] !== 'application/json') {
          const fileName = response.headers['pragma'] || `${moment().format('DD.MM.YYYY_HH:MM')}.csv`
          downloadContent(
            response.data, fileName, response.headers['content-type']
          )
        }
        else {
          if (response.data.message) {
            toast(response.data.message.text, {
              "type": response.data.message.type,
              "position": response.data.message.position,
              "dangerouslyHTMLString": true
            })
          }
          else if (response.data.persistent_message) {
            this.persistentMessageDialog = true
            this.persistentMessage = response.data.persistent_message
          }
          else {
            toast(this.$t("successAdminAction"))
          }
        }

        this.actionDialogConfirmation = false
        this.actionFormDialogOpen = false
        this.actionLoading = false
        this.selected = []
        this.getListData()
      }).catch(error => {
        this.actionLoading = false
        console.error(`Admin action ${this.actionSelected} error:`, error)

        const errorResult = this.$handleError(error)
        if (errorResult.fieldErrors) {
          this.$refs.fieldscontainer.updateErrors(errorResult.fieldErrors)
        }
        if (errorResult.persistentMessage) {
          this.persistentMessageDialog = true
          this.persistentMessage = errorResult.persistentMessage
        }
      })
    },
    updateSortBy(options) {
      if (!options[0]) {
        this.ordering = null
      } else {
        const desc = options[0].order === 'desc'? '-' : ''
        const field_slug = options[0].key
        this.ordering = `${desc}${field_slug}`
      }

      this.serializeQuery()
      this.getListData()
    },
    formatDateTime(dateString) {
      if (dateString) {
        return moment(dateString).format('YYYY-MM-DD HH:mm')
      }
    },
    getTableInfo() {
      return this.categorySchema.getTableInfo()
    },
    getChoiceValue(item, header) {
      const value = item[header.key]
      if (typeof value === 'object') return value.value
      return value
    },
    getChoiceTitle(item, header) {
      const value = item[header.key]
      if (typeof value === 'object') return value.title
      return value
    },
    createdEvent() {
      this.serializeQuery()
      this.getListData()
    },
    stripHtml(html) {
      const div = document.createElement('div')
      div.innerHTML = html
      return div.textContent?.trim() ?? ''
    },
  },
}
</script>
