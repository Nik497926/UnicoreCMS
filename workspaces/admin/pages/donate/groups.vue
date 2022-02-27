<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toolbar class="mb-4">
          <template v-slot:start>
            <div class="my-2">
              <Button label="Создать" icon="pi pi-plus" class="p-button-success mr-2" @click="openDialog()" />
              <Button
                label="Удалить"
                icon="pi pi-trash"
                class="p-button-danger"
                :disabled="!selected || !selected.length"
                @click="removeMany()"
              />
            </div>
          </template>
        </Toolbar>

        <DataTable
          :value="groups"
          :loading="loading"
          :rows="20"
          paginator
          :filters.sync="filters"
          rowHover
          responsiveLayout="scroll"
          :selection.sync="selected"
          dataKey="id"
          filterDisplay="menu"
        >
          <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
              <h5 class="m-0">Управление донат-группами</h5>
              <span class="block mt-2 md:mt-0 p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Поиск..." />
              </span>
            </div>
          </template>
          <Column selectionMode="multiple" :styles="{ width: '3rem' }"></Column>
          <Column sortable field="id" header="ID" :styles="{ width: '8rem' }"></Column>
          <Column field="name" header="Название" sortable>
            <template #body="slotProps">
              <div class="flex align-items-center">
                <Avatar v-if="slotProps.data.icon" :image="`${$config.apiUrl + '/' + slotProps.data.icon}`" shape="circle" />
                <Avatar v-else icon="pi pi-image" shape="circle" />
                <span class="ml-2">{{ slotProps.data.name }}</span>
              </div>
            </template>
          </Column>
          <Column field="servers" header="Серверы" filterField="servers" :showFilterMatchModes="false">
            <template #body="slotProps">
              <Tag class="mr-2 mb-2" v-for="server in slotProps.data.servers" :key="server.id" :value="server.name"></Tag>
            </template>
            <template #filter="{ filterModel }">
              <div class="mb-3 font-bold">Серверы</div>
              <MultiSelect
                display="chip"
                :filter="true"
                v-model="filterModel.value"
                :options="servers"
                optionLabel="name"
                placeholder="Выберите серверы"
                class="p-column-filter"
              >
                <template #option="slotProps">
                  <div class="p-multiselect-representative-option">
                    <Avatar v-if="slotProps.option.icon" :image="`${$config.apiUrl + '/' + slotProps.option.icon}`" shape="circle" />
                    <Avatar v-else icon="pi pi-image" shape="circle" />
                    <span class="ml-2">{{ slotProps.option.name }} (#{{ slotProps.option.id }})</span>
                  </div>
                </template>
              </MultiSelect>
            </template>
          </Column>
          <Column :styles="{ width: '12rem' }">
            <template #body="slotProps">
              <Button @click="openDialog(slotProps.data)" icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" />
              <Button @click="openFileDialog(slotProps.data)" icon="pi pi-images" class="p-button-rounded p-button-secondary mr-2" />
              <Button @click="removeGroup(slotProps.data.id)" icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" />
            </template>
          </Column>
        </DataTable>

        <Dialog :visible.sync="fileDialog" :style="{ width: '400px' }" :modal="true" header="Иконка донат-группы" class="p-fluid">
          <div class="flex align-items-center justify-content-center flex-wrap w-full">
            <Avatar v-if="group.icon" :image="`${$config.apiUrl + '/' + group.icon}`" size="xlarge" shape="circle" />
            <Avatar v-else icon="pi pi-image" size="xlarge" shape="circle" />
            <div class="field ml-6 mb-0">
              <Button label="Загрузить" icon="pi pi-upload" @click="$refs.fileInput.choose()" />
              <Button label="Удалить" icon="pi pi-trash" class="p-button-secondary mt-2" @click="removeIcon()" />
              <FileUpload
                ref="fileInput"
                style="display: none"
                mode="basic"
                name="file"
                accept="image/*"
                :auto="true"
                :customUpload="true"
                @uploader="uploadIcon"
              />
            </div>
          </div>
        </Dialog>

        <ValidationObserver v-slot="{ invalid }">
          <Dialog
            :visible.sync="groupDialog"
            :closable="false"
            :style="{ width: '600px' }"
            :modal="true"
            header="Создание/редактирование группы"
            class="p-fluid"
          >
            <ValidationProvider name="Название" rules="required" v-slot="{ errors }">
              <div class="field">
                <label>Название</label>
                <InputText v-model="group.name" />
                <small v-show="errors[0]" class="p-error" v-text="errors[0]"></small>
              </div>
            </ValidationProvider>
            <ValidationProvider name="ID в игре" rules="required" v-slot="{ errors }">
              <div class="field">
                <label>ID в игре</label>
                <InputText v-model="group.ingame_id" />
                <small v-show="errors[0]" class="p-error" v-text="errors[0]"></small>
              </div>
            </ValidationProvider>
            <div class="field">
              <label>Серверы</label>
              <MultiSelect
                v-model="group.servers"
                display="chip"
                :filter="true"
                :options="servers"
                optionLabel="name"
                placeholder="Выберите серверы"
                class="p-column-filter"
                appendTo="body"
              >
                <template #option="slotProps">
                  <div class="p-multiselect-representative-option">
                    <Avatar v-if="slotProps.option.icon" :image="`${$config.apiUrl + '/' + slotProps.option.icon}`" shape="circle" />
                    <Avatar v-else icon="pi pi-image" shape="circle" />
                    <span class="ml-2">{{ slotProps.option.name }} (#{{ slotProps.option.id }})</span>
                  </div>
                </template>
              </MultiSelect>
            </div>
            <div class="field">
              <label>Доступные периоды</label>
              <MultiSelect
                v-model="group.periods"
                display="chip"
                :filter="true"
                :options="periods"
                optionLabel="name"
                placeholder="Выберите периоды"
                class="p-column-filter"
                appendTo="body"
              ></MultiSelect>
            </div>
            <div class="field">
              <label>Киты</label>
              <MultiSelect
                v-model="group.kits"
                display="chip"
                :filter="true"
                :options="kits"
                optionLabel="name"
                placeholder="Выберите киты"
                class="p-column-filter"
                appendTo="body"
              ></MultiSelect>
            </div>
            <div class="field">
              <label>Инжект веб-прав</label>
              <AutoComplete
                v-model="group.web_perms"
                :multiple="true"
                :suggestions="autocompleateFilterd"
                @complete="searchAutocompleate($event)"
                appendTo="body"
                :completeOnFocus="true"
                placeholder="Выберите разрешения"
              />
            </div>
            <div class="field">
              <label>Описание</label>
              <Editor v-model="group.description" editorStyle="height: 220px">
                <template #toolbar>
                  <span class="ql-formats">
                    <button class="ql-bold"></button>
                    <button class="ql-italic"></button>
                    <button class="ql-underline"></button>
                  </span>
                </template>
              </Editor>
            </div>
            <div class="field">
              <label>Возможности (построение блока)</label>
              <Button @click="addFeature" icon="pi pi-plus" class="p-button-rounded p-button-text" />
              <DataTable
                :value="group.features"
                editMode="row"
                :editingRows.sync="features"
                @row-edit-save="onFeatureEditSave"
                responsiveLayout="scroll"
              >
                <Column field="title" header="Заголовок" :styles="{ width: '40%' }">
                  <template #editor="slotProps">
                    <InputText v-model="slotProps.data[slotProps.column.field]" />
                  </template>
                </Column>
                <Column field="description" header="Описание" :styles="{ width: '50%' }">
                  <template #editor="slotProps">
                    <Textarea v-model="slotProps.data[slotProps.column.field]" :autoResize="true" />
                  </template>
                </Column>
                <Column :rowEditor="true" :styles="{ width: '10%', 'min-width': '8rem' }" :bodyStyle="{ 'text-align': 'right' }"></Column>
                <Column v-if="!features || !features.length" :styles="{ width: '3rem' }" :bodyStyle="{ 'text-align': 'center' }">
                  <template #body="slotProps">
                    <Button
                      @click="removeFeature(slotProps.index)"
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-text p-button-danger"
                    />
                  </template>
                </Column>
              </DataTable>
            </div>
            <div class="grid">
              <div class="col-6">
                <ValidationProvider name="Цена" rules="required|min:0.01" v-slot="{ errors }">
                  <div class="field">
                    <label>Цена</label>
                    <InputNumber v-model="group.price" currency="RUB" locale="ru-RU" mode="currency" />
                    <small v-show="errors[0]" class="p-error" v-text="errors[0]"></small>
                  </div>
                </ValidationProvider>
              </div>
              <div class="col-6">
                <ValidationProvider name="Скидка" rules="min_value:0|max_value:99" v-slot="{ errors }">
                  <div class="field">
                    <label>Скидка</label>
                    <InputNumber suffix=" %" :useGrouping="false" v-model="group.sale" />
                    <small v-show="errors[0]" class="p-error" v-text="errors[0]"></small>
                  </div>
                </ValidationProvider>
              </div>
            </div>
            <template #footer>
              <Button :disabled="loading" label="Отмена" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
              <Button
                :disabled="loading || invalid"
                label="Сохранить"
                icon="pi pi-check"
                class="p-button-text"
                @click="updateMode ? updateGroup() : createGroup()"
              />
            </template>
          </Dialog>
        </ValidationObserver>
      </div>
    </div>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'
import { ValidationObserver, ValidationProvider } from 'vee-validate'

export default {
  head: {
    title: 'Донат-группы',
  },
  components: {
    ValidationObserver,
    ValidationProvider,
  },
  data() {
    return {
      groups: null,
      loading: true,
      selected: null,
      updateMode: false,
      fileDialog: false,
      group: {
        id: null,
        name: null,
        ingame_id: null,
        description: null,
        price: null,
        icon: null,
        sale: null,
        features: [],
        servers: [],
        web_perms: [],
        kits: [],
        periods: [],
      },
      groupDialog: false,
      filters: {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        servers: { value: null, matchMode: FilterMatchMode.CONTAINS },
      },
      autocompleate: null,
      autocompleateFilterd: null,
      servers: null,
      periods: null,
      kits: null,
      features: [],
    }
  },
  async fetch() {
    this.loading = true
    this.groupDialog = false
    this.fileDialog = false
    this.groups = await this.$axios.get('/donates/groups').then((res) => res.data)
    this.kits = await this.$axios.get('/donates/group-kits').then((res) => res.data)
    this.periods = await this.$axios.get('/donates/periods').then((res) => res.data)
    this.servers = await this.$axios.get('/servers').then((res) => res.data)
    this.autocompleate = await this.$axios.get('/admin/roles/autocompleate').then((res) => res.data)
    this.loading = false
  },
  methods: {
    onFeatureEditSave(event) {
      let { newData, index } = event
      this.group.features[index] = newData
    },
    addFeature() {
      this.group.features.push({
        title: null,
        description: null,
      })
    },
    removeFeature(index) {
      this.group.features.splice(index, 1)
      this.features = []
    },
    searchAutocompleate(event) {
      if (!event.query.trim().length) {
        this.autocompleateFilterd = this.autocompleate
      } else {
        this.autocompleateFilterd = [
          event.query.toLowerCase(),
          ...this.autocompleate.filter((perm) => {
            return perm.toLowerCase().includes(event.query.toLowerCase())
          }),
        ]

        if (this.autocompleateFilterd.length === 0) {
          this.autocompleateFilterd = [event.query.toLowerCase()]
        }
      }
    },
    hideDialog() {
      this.groupDialog = false
      this.features = []
    },
    async uploadIcon(event) {
      let formData = new FormData()
      formData.append('file', event.files[0])

      try {
        await this.$axios.patch(`/donates/groups/icon/` + this.group.id, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        this.$toast.add({
          severity: 'success',
          detail: 'Картинка успешно обновлена',
          life: 3000,
        })
        await this.$fetch()
      } catch {
        this.fileDialog = false
        this.$toast.add({
          severity: 'error',
          detail: 'Поддерживаются только изображения',
          life: 3000,
        })
      }
    },
    async removeIcon() {
      try {
        await this.$axios.delete(`/donates/groups/icon/` + this.group.id)
        this.$toast.add({
          severity: 'success',
          detail: 'Картинка успешно удалена',
          life: 3000,
        })
        await this.$fetch()
      } catch {}
    },
    async openFileDialog(group) {
      this.group = this.$_.pick(group, this.$_.deepKeys(this.group))
      this.fileDialog = true
    },
    async openDialog(group = null) {
      this.updateMode = !!group
      if (group) {
        this.group = this.$_.pick(
          await this.$axios.get('/donates/groups/' + group.id).then((res) => res.data),
          this.$_.deepKeys(this.group)
        )
        if (!this.group.features) this.group.features = []
      } else {
        this.group = {
          id: null,
          name: null,
          ingame_id: null,
          description: null,
          icon: null,
          price: null,
          sale: null,
          features: [],
          servers: [],
          web_perms: [],
          kits: [],
          periods: [],
        }
      }
      this.groupDialog = true
    },
    async createGroup() {
      this.loading = true
      try {
        await this.$axios.post('/donates/groups', {
          ...this.group,
          kits: this.group.kits.map((kit) => kit.id),
          periods: this.group.periods.map((period) => period.id),
          servers: this.group.servers.map((server) => server.id),
        })
        this.$toast.add({
          severity: 'success',
          detail: 'Группа успешно добавлена',
          life: 3000,
        })
        await this.$fetch()
      } catch (err) {
        this.loading = false
        this.$toast.add({
          severity: 'error',
          detail: 'Введены некоректные данные',
          life: 3000,
        })
      }
    },
    async updateGroup() {
      this.loading = true
      try {
        await this.$axios.patch('/donates/groups/' + this.group.id, {
          ...this.$_.omit(this.group, 'id'),
          kits: this.group.kits.map((kit) => kit.id),
          periods: this.group.periods.map((period) => period.id),
          servers: this.group.servers.map((server) => server.id),
        })
        this.$toast.add({
          severity: 'success',
          detail: 'Группа успешно редактирована',
          life: 3000,
        })
        await this.$fetch()
      } catch (err) {
        this.loading = false
        this.$toast.add({
          severity: 'error',
          detail: 'Введены некоректные данные',
          life: 3000,
        })
      }
    },
    async removeMany() {
      this.$confirm.require({
        message: `Данный процесс будет необратим!`,
        header: `Удаления ${this.selected.length} объектов`,
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.loading = true
          try {
            await this.$axios.delete('/donates/groups/bulk/', {
              data: {
                items: this.selected.map((group) => group.id),
              },
            })
            this.$toast.add({
              severity: 'success',
              detail: 'Группы успешно удалены',
              life: 3000,
            })
            this.selected = []
          } catch {}
          await this.$fetch()
        },
      })
    },
    async removeGroup(id) {
      this.$confirm.require({
        message: `Данный процесс будет необратим!`,
        header: 'Подтверждение удаления',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.loading = true
          try {
            await this.$axios.delete('/donates/groups/' + id)
            this.$toast.add({
              severity: 'success',
              detail: 'Группа успешно удалена',
              life: 3000,
            })
          } catch {}
          await this.$fetch()
        },
      })
    },
  },
}
</script>