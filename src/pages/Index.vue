<template>
  <q-page class="tw-p-4">
    <q-input
      rounded
      outlined
      placeholder="Search"
      class="border-primary"
      debounce="500"
      bg-color="white"
      v-model="search"
      @update:model-value="onSearhInput"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <template v-if="otr.carList.length > 0">
      <div class="tw-text-lg tw-my-4">
        Found
        <span class="text-primary">{{ otr.getFoundNumber }}</span> ads from
        <strong>{{ otr.lastSearch }}</strong>
        <template v-if="otr.metadata?.found > otr.metadata.total_data">
          and we only get
          <span class="text-primary">{{
            otr.metadata.total_data
          }}</span></template
        >
      </div>
      <div class="tw-flex tw-justify-between tw-items-center tw-w-full">
        <div class="tw-flex tw-items-center tw-gap-4">
          <q-select
            label="Sort By"
            borderless
            :options="sortingOptions"
            v-model="otr.sort"
            @update:model-value="otr.sortCars()"
            map-options
            dense
            class="tw-w-52"
            emit-value
          >
            <template v-slot:prepend>
              <q-icon name="sort" />
            </template>
          </q-select>
        </div>
        <q-input
          placeholder="Search in search..."
          v-model="filter"
          dense
          filled
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <q-select
        label="Source"
        :options="otr.getSource"
        v-model="otr.source"
        use-chips
        multiple
        map-options
        emit-value
        class="tw-w-full tw-mt-2"
        borderless
      >
        <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
          <q-item v-bind="itemProps">
            <q-item-section> {{ opt.label }} ({{ opt.count }}) </q-item-section>
            <q-item-section side>
              <q-checkbox
                :model-value="selected"
                @update:model-value="toggleOption(opt)"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-table
        class="tw-mt-2"
        :rows="otr.carList"
        :columns="columns"
        row-key="title"
        selection="multiple"
        v-model:selected="this.otr.cars"
        grid
        hide-header
        :filter="filter"
        :pagination="{ rowsPerPage: 20 }"
      >
        <template v-slot:item="props">
          <div
            class="tw-grid tw-grid-cols-1 tw-mb-4 tw-w-full grid-style-transition"
            :style="props.selected ? 'transform: scale(0.95);' : ''"
          >
            <q-card
              bordered
              flat
              class="tw-w-full tw-cursor-pointer"
              :class="props.selected ? 'tw-border-primary tw-border-2' : ''"
              @click="
                onSelect(
                  { ...props.row, id: props.key + props.rowIndex },
                  props.key + props.rowIndex
                )
              "
            >
              <q-btn
                v-if="props.selected"
                round
                icon="done"
                color="primary"
                class="absolute tw-z-50"
                style="top: 0; left: -20px; transform: translateY(-50%)"
              />

              <q-card-section
                class="tw-flex tw-justify-between tw-items-center"
              >
                <div class="tw-flex tw-items-center">
                  <q-avatar
                    size="150px"
                    square
                    class="tw-mr-4 tw-border tw-rounded"
                  >
                    <img
                      v-if="props.row.thumbnail"
                      :src="props.row.thumbnail"
                    />
                    <img v-else src="~assets/default_thumbnail.svg" />
                  </q-avatar>
                  <div>
                    <div class="text-h6">
                      <template v-if="props.row.title.length > 80">
                        {{ substring(props.row.title, 80) }}
                        <q-tooltip> {{ props.row.title }} </q-tooltip>
                      </template>
                      <template v-else>
                        {{ props.row.title }}
                      </template>
                    </div>
                    <div>
                      <span class="tw-mr-1" v-if="props.row.brand">{{
                        props.row.brand
                      }}</span
                      >{{ props.row.model }}
                    </div>
                    <div class="tw-w-96" v-if="props.row.detail">
                      <q-badge
                        v-for="(detail, id) in props.row.detail.split(',')"
                        v-bind:key="id"
                        color="primary"
                        class="tw-mr-1"
                        outline
                        >{{ detail }}</q-badge
                      >
                    </div>

                    <div
                      class="text-caption text-grey tw-w-96"
                      v-if="props.row.description"
                    >
                      {{ substring(props.row.description, 100) }}...
                    </div>
                    <q-btn
                      target="_blank"
                      v-if="props.row.source_link"
                      :href="props.row.source_link"
                      unelevated
                      color="primary"
                      no-caps
                      class="tw-mt-2"
                    >
                      {{ props.row.source_name }}
                    </q-btn>
                    <q-btn
                      v-else-if="props.row.source_name"
                      unelevated
                      color="primary"
                      no-caps
                      class="tw-mt-2"
                    >
                      {{ props.row.source_name }}
                    </q-btn>
                  </div>
                </div>
                <div>
                  <div class="text-h6 text-primary tw-justify-end tw-flex">
                    {{ idr(props.row.price) }}
                  </div>
                  <div
                    v-if="props.row.location"
                    class="text-grey text-caption tw-justify-end tw-flex tw-items-center"
                  >
                    <q-icon name="place" />
                    {{ props.row.location }}
                  </div>
                  <div class="tw-justify-end tw-flex">
                    {{ props.row.created_at }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </template>
    <div
      class="tw-flex tw-mt-28 tw-flex-col tw-items-center tw-justify-center"
      v-if="!isSearch"
    >
      <q-avatar size="350px">
        <q-img src="~assets/search.svg" spinner-color="primary" />
      </q-avatar>
      <!-- <h1 class="text-h4">Find some cars? 👀</h1> -->
    </div>
    <div
      class="tw-flex tw-mt-12 tw-flex-col tw-items-center tw-justify-center"
      v-if="isSearch && otr.carList.length < 1"
    >
      <q-avatar size="400px">
        <q-img src="~assets/not_found.svg" spinner-color="primary" />
      </q-avatar>
      <h1 class="text-h2">Car {{ otr.lastSearch }} not found...</h1>
    </div>
  </q-page>
</template>
<style lang="sass">
.grid-style-transition
  transition: transform .28s, background-color .28s
</style>
<script>
import { defineComponent, ref } from "vue";
import { useOTRStore } from "stores/otr";

const columns = [
  {
    name: "title",
    field: "title",
  },
  {
    name: "price",
    field: "price",
  },
  {
    name: "detail",
    field: "detail",
  },
  {
    name: "brand",
    field: "brand",
  },
  {
    name: "model",
    field: "model",
  },
  {
    name: "location",
    field: "location",
  },
  {
    name: "source_name",
    field: "source_name",
  },
];

export default defineComponent({
  setup() {
    const otr = useOTRStore();

    const sortingOptions = [
      {
        label: "New Date",
        value: "",
      },
      {
        label: "Old Date",
        value: "date-asc",
      },
      {
        label: "Highest Price",
        value: "price-desc",
      },
      {
        label: "Lowest Price",
        value: "price-asc",
      },
    ];
    return {
      otr,
      columns,
      sortingOptions,
      filter: ref(""),
      selected: ref([]),
      search: ref(""),
      sort: ref(""),
      isSearch: ref(false),
    };
  },
  methods: {
    getData(query) {
      this.otr.searchCars(query, this.sort).then((res) => {
        if (res != false) {
          this.isSearch = true;
        } else {
          this.isSearch = false;
        }
      });
    },
    idr(val) {
      return (
        "Rp. " + val.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1\.")
      );
    },
    substring(value, num) {
      if (value.length > num) {
        return value.slice(0, num) + "...";
      } else {
        return value;
      }
    },

    onSelect(data, index) {
      this.otr.addCars(data, index);
      this.$emit("onSelect");
    },

    onSearhInput() {
      this.getData(this.search);
    },
  },
  mounted() {
    this.search = this.otr.lastSearch;
    if (this.otr.carList > 0) {
      this.isSearch = false;
    } else {
      if (this.search != "") {
        this.isSearch = true;
      }
    }
  },
  watch: {
    sort() {
      this.otr.sortCars(this.sort);
    },
  },
});
</script>
