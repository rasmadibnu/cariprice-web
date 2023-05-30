<template>
  <q-layout view="hHh LpR fFf">
    <q-header reveal class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar> -->
          <div class="tw-flex tw-justify-between">
            <div class="tw-flex">
              <div class="tw-font-bold tw-italic" style="margin-right: 3px">
                CAR
              </div>
              <div class="tw-font-['Satisfy']">i Price</div>
            </div>
            <div>
              <q-btn flat icon="list" label="List OTR" to="/otr" />
              <q-btn flat icon="currency_exchange">
                <q-menu
                  v-model="panelOTR"
                  persistent
                  class="tw-p-4 tw-w-96 tw-overflow-hidden"
                >
                  <div class="tw-flex tw-justify-between tw-items-center">
                    <div class="tw-text-lg">
                      Calculations (<span class="text-primary">{{
                        otr.cars.length
                      }}</span
                      >)
                    </div>
                    <q-btn
                      icon="close"
                      size="sm"
                      flat
                      @click="panelOTR = false"
                      dense
                    />
                  </div>
                  <template v-if="otr.cars.length > 0">
                    <div class="tw-my-4">
                      <div v-for="car in otr.cars" v-bind:key="car">
                        <div
                          class="tw-flex tw-justify-between tw-items-center tw-my-1"
                        >
                          <div>
                            <div style="font-size: x-small">
                              {{ substring(car.title, 40) }}
                            </div>
                            <q-btn
                              color="primary"
                              flat
                              dense
                              size="xs"
                              :href="car.source_link"
                              :label="car.source_name"
                            />
                          </div>

                          <div class="text-primary">
                            {{ idr(car.price) }}
                          </div>
                        </div>
                        <q-separator />
                      </div>
                      <div class="tw-flex tw-justify-between tw-mt-4">
                        <div>Total</div>
                        <div class="text-primary">
                          {{ idr(otr.getSum) }}
                        </div>
                      </div>
                      <div class="tw-flex tw-justify-between">
                        <div>Average</div>
                        <div class="text-primary">
                          {{ idr(otr.getAverage) }}
                        </div>
                      </div>
                      <div class="tw-flex tw-justify-between">
                        <div>
                          Depreciation (<span class="text-primary"
                            >{{ otr.depreciation }}%</span
                          >)
                        </div>
                        <q-popup-edit
                          v-model.number="otr.depreciation"
                          auto-save
                          v-slot="scope"
                        >
                          <q-input
                            v-model.number="scope.value"
                            dense
                            autofocus
                            counter
                            @keyup.enter="scope.set"
                          />
                        </q-popup-edit>
                        <div class="text-primary">
                          {{ idr(otr.getDepreciation) }}
                        </div>
                      </div>
                    </div>

                    <div class="tw-flex tw-justify-between">
                      <q-btn
                        flat
                        dense
                        icon="clear_all"
                        color="negative"
                        @click="otr.cars = []"
                      />
                      <q-btn
                        unelevated
                        size="sm"
                        no-caps
                        label="Save"
                        color="primary"
                        @click="onOpenDialog()"
                      />
                    </div>
                  </template>
                  <template v-else>
                    <div class="tw-my-4">
                      There is no cars selected for calculate
                    </div>
                  </template>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <template v-if="!isOTRPage"
        ><div class="text-h6 tw-px-4 tw-pt-4">Filter</div>
        <q-expansion-item
          v-model="otr.expanded_source"
          icon="o_travel_explore"
          header-class="tw-text-lg tw-font-bold"
          label="Source"
        >
          <q-card>
            <q-card-section class="q-pa-none tw-ml-2">
              <q-scroll-area
                style="max-height: 300px"
                :style="{ height: 35 * otr.sourceList.length + 'px' }"
              >
                <q-option-group
                  :options="otr.sourceList"
                  type="toggle"
                  v-model="otr.source"
                  @update:model-value="(val) => otr.filterSource(val)"
                >
                  <template v-slot:label="props">
                    {{ props.label }}
                    <q-badge rounded>{{ props.count }}</q-badge>
                  </template>
                </q-option-group>
              </q-scroll-area>
            </q-card-section>
          </q-card>
        </q-expansion-item>
        <q-expansion-item
          v-model="otr.expanded_location"
          icon="o_pin_drop"
          header-class="tw-text-lg tw-font-bold"
          label="Location"
        >
          <q-card>
            <q-card-section class="q-pa-none tw-ml-2">
              <q-scroll-area
                style="max-height: 300px"
                :style="{ height: 35 * otr.getLocations.length + 'px' }"
              >
                <q-option-group
                  :options="otr.getLocations"
                  type="checkbox"
                  v-model="otr.locations"
                  @update:model-value="(val) => otr.filterLocation(val)"
                >
                  <template v-slot:label="props">
                    {{ props.label }}
                    <q-badge rounded>{{ props.count }}</q-badge>
                  </template>
                </q-option-group>
              </q-scroll-area>
            </q-card-section>
          </q-card>
        </q-expansion-item>
        <!-- <div class="tw-grid tw-grid-cols-2 tw-mt-4 tw-gap-4">
          <q-select label="City" class="tw-col-span-2" dense />
          <q-select label="Brand" class="" dense />
          <q-select label="Model" class="" dense />
          <div
            class="tw-col-span-2 tw-grid tw-grid-cols-2 tw-gap-x-4 tw-gap-y-2"
          >
            <div class="tw-col-span-2">Price</div>
            <q-select label="From" class="" dense />
            <q-select label="To" class="" dense />
          </div>
        </div> -->
      </template>
      <template v-else>
        <div class="tw-p-4">
          <div class="text-h6">Input OTR</div>
          <q-form @submit.prevent="submit" ref="myForm">
            <div class="tw-grid tw-grid-cols-2 tw-mt-4 tw-gap-x-4 tw-gap-2">
              <q-input
                class="tw-col-span-2"
                dense
                filled
                v-model="otr.payload.title"
                :rules="[(val) => !!val || 'This field required']"
                label="Unit Name"
              />
              <q-input
                type="text"
                label="Description"
                class="tw-col-span-2"
                hint=""
                dense
                filled
                v-model="otr.payload.description"
              />
              <q-input
                class="tw-col-span-2"
                v-model="otr.payload.location"
                dense
                filled
                label="Location"
                :rules="[(val) => !!val || 'This field required']"
              />
              <q-input
                type="text"
                label="Brand"
                hint=""
                v-model="otr.payload.brand"
                dense
                filled
              />
              <q-input
                type="text"
                label="Model"
                hint=""
                v-model="otr.payload.model"
                dense
                filled
              />
              <q-select
                type="text"
                label="Detail"
                hint=""
                v-model="otr.payload.detail"
                use-input
                use-chips
                multiple
                hide-dropdown-icon
                input-debounce="0"
                new-value-mode="add-unique"
                dense
                filled
                class="tw-col-span-2"
              />
              <q-input
                type="text"
                label="Fuel"
                hint=""
                v-model="otr.payload.fuel"
                dense
                filled
              />
              <q-input
                type="text"
                label="Status"
                hint=""
                v-model="otr.payload.status"
                dense
                filled
              />
              <q-input
                type="text"
                label="Source"
                class="tw-col-span-2"
                hint=""
                v-model="otr.payload.source_name"
                dense
                filled
              />
              <div class="tw-col-span-2">
                <div
                  class="tw-flex tw-justify-between tw-items-center"
                  v-for="(detail, id) in otr.detailOTR"
                  v-bind:key="id"
                >
                  <div>
                    <div class="tw-text-xs">{{ detail.title }}</div>
                    <q-btn
                      flat
                      dense
                      color="primary"
                      no-caps
                      :href="detail.source_link"
                      target="_blank"
                      size="xs"
                      >{{ detail.source_name }}</q-btn
                    >
                  </div>

                  <div class="text-primary">
                    {{ idr(detail.price)
                    }}<q-btn
                      flat
                      size="xs"
                      dense
                      class="tw-ml-2"
                      icon="clear"
                      color="negative"
                      @click="otr.removeUnit(id)"
                    />
                  </div>
                </div>
                <template v-if="otr.detailOTR.length > 0">
                  <div class="tw-flex tw-justify-between tw-mt-4">
                    <div>Total</div>
                    <div class="text-primary">
                      {{ idr(otr.getSumOTR) }}
                    </div>
                  </div>
                  <div class="tw-flex tw-justify-between">
                    <div>Average</div>
                    <div class="text-primary">
                      {{ idr(otr.getAverageOTR) }}
                    </div>
                  </div>
                  <div class="tw-flex tw-justify-between tw-mb-4">
                    <div>
                      Depreciation (<span class="text-primary"
                        >{{ otr.payload.depreciation }}%</span
                      >)
                    </div>
                    <q-popup-edit
                      v-model.number="otr.payload.depreciation"
                      auto-save
                      v-slot="scope"
                    >
                      <q-input
                        v-model.number="scope.value"
                        dense
                        autofocus
                        counter
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                    <div class="text-primary">
                      {{ idr(otr.getDepreciationOTR) }}
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div class="tw-flex tw-justify-end tw-gap-1">
              <q-btn
                icon-right="add"
                label="Add Unit"
                unelevated
                color="primary"
                no-caps
                size="sm"
                @click="detailUnit = true"
                outline
              />
              <q-btn
                type="submit"
                color="primary"
                label="Save"
                no-caps
                unelevated
                size="sm"
              />
            </div>
          </q-form>
        </div>
      </template>
    </q-drawer>

    <q-page-container class="tw-bg-gray-50">
      <router-view @onSelect="onSelect" />
    </q-page-container>

    <q-dialog v-model="detailUnit">
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">Add Unit</div>
        </q-card-section>
        <q-form @submit.prevent="addUnit()">
          <q-card-section class="q-pt-none tw-grid tw-grid-cols-2 tw-gap-2">
            <q-input
              label="Name"
              v-model.number="otr.otrform.title"
              class="tw-col-span-2"
              filled
              hint=""
            />
            <q-input
              filled
              mask="###.###.###.###.###"
              unmasked-value
              reverse-fill-mask
              prefix="Rp."
              label="Price"
              v-model.number="otr.otrform.price"
              :rules="[(val) => !!val || 'This field required']"
              class="tw-col-span-2"
            />
            <q-input
              filled
              type="text"
              label="Source"
              hint=""
              v-model="otr.otrform.source_name"
            />
            <q-input
              filled
              type="text"
              label="Link"
              hint=""
              v-model="otr.otrform.source_link"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              type="submit"
              color="primary"
              v-close-popup
              no-caps
            />
            <q-btn flat label="Add" type="submit" color="primary" no-caps />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="formSave">
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">Save OTR</div>
        </q-card-section>
        <q-form @submit.prevent="submitOTR()" ref="dialogOTR">
          <q-card-section
            class="q-pt-none tw-grid tw-grid-cols-2 tw-gap-2 tw-gap-x-4"
          >
            <q-input
              class="tw-col-span-2"
              dense
              filled
              v-model="otr.payload.title"
              :rules="[(val) => !!val || 'This field required']"
              label="Unit Name"
            />
            <q-input
              type="text"
              label="Description"
              class="tw-col-span-2"
              hint=""
              dense
              filled
              v-model="otr.payload.description"
            />
            <q-input
              class="tw-col-span-2"
              v-model="otr.payload.location"
              dense
              filled
              label="Location"
              :rules="[(val) => !!val || 'This field required']"
            />
            <q-input
              type="text"
              label="Brand"
              hint=""
              v-model="otr.payload.brand"
              dense
              filled
            />
            <q-input
              type="text"
              label="Model"
              hint=""
              v-model="otr.payload.model"
              dense
              filled
            />
            <q-select
              type="text"
              label="Detail"
              hint=""
              v-model="otr.payload.detail"
              use-input
              use-chips
              multiple
              hide-dropdown-icon
              input-debounce="0"
              new-value-mode="add-unique"
              dense
              filled
              class="tw-col-span-2"
            />
            <q-input
              type="text"
              label="Fuel"
              hint=""
              v-model="otr.payload.fuel"
              dense
              filled
            />
            <q-input
              type="text"
              label="Status"
              hint=""
              v-model="otr.payload.status"
              dense
              filled
            />
            <div class="tw-col-span-2">
              <div v-for="car in otr.cars" v-bind:key="car">
                <div class="tw-flex tw-justify-between tw-items-center tw-my-1">
                  <div>
                    <div style="font-size: x-small">
                      {{ substring(car.title, 40) }}
                    </div>
                    <q-btn
                      color="primary"
                      flat
                      dense
                      size="xs"
                      :href="car.source_link"
                      :label="car.source_name"
                    />
                  </div>

                  <div class="text-primary">
                    {{ idr(car.price) }}
                  </div>
                </div>
                <q-separator />
              </div>
              <div class="tw-flex tw-justify-between tw-mt-4">
                <div>Total</div>
                <div class="text-primary">
                  {{ idr(otr.getSum) }}
                </div>
              </div>
              <div class="tw-flex tw-justify-between">
                <div>Average</div>
                <div class="text-primary">
                  {{ idr(otr.getAverage) }}
                </div>
              </div>
              <div class="tw-flex tw-justify-between">
                <div>
                  Depreciation (<span class="text-primary"
                    >{{ otr.depreciation }}%</span
                  >)
                </div>
                <q-popup-edit
                  v-model.number="otr.depreciation"
                  auto-save
                  v-slot="scope"
                >
                  <q-input
                    v-model.number="scope.value"
                    dense
                    autofocus
                    counter
                    @keyup.enter="scope.set"
                  />
                </q-popup-edit>
                <div class="text-primary">
                  {{ idr(otr.getDepreciation) }}
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              unelevated
              outline
              label="Cancel"
              no-caps
              @click="onCloseDialog()"
              color="primary"
            />

            <q-btn
              unelevated
              label="Save"
              no-caps
              type="submit"
              color="primary"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { ref, watch } from "vue";
import { useOTRStore } from "src/stores/otr";

export default {
  setup() {
    const otr = useOTRStore();
    const leftDrawerOpen = ref(false);
    const isOTRPage = ref(false);

    return {
      otr,
      leftDrawerOpen,
      isOTRPage,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      filter: ref({}),
      panelOTR: ref(false),
      detailUnit: ref(false),
      formSave: ref(false),
    };
  },
  mounted() {
    if (this.$route.path == "/otr") {
      this.isOTRPage = true;
    } else {
      this.isOTRPage = false;
    }
  },
  methods: {
    onSelect() {
      if (this.otr.cars.length > 0) {
        this.panelOTR = true;
      } else {
        this.panelOTR = false;
      }
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
    submit() {
      if (this.otr.detailOTR.length > 0) {
        this.otr.createOTR().then((res) => {
          this.$refs.myForm.resetValidation();
          this.$q.notify({
            message: "OTR Successfully created",
            color: "positive",
          });
        });
      } else {
        this.$q.notify({
          message: "Please add minimun 1 unit",
          color: "negative",
        });
      }
    },
    addUnit() {
      this.otr.addUnit().then((res) => {
        this.detailUnit = false;
      });
    },
    onOpenDialog() {
      this.otr.payload.title = this.otr.lastSearch;
      this.otr.payload.brand = this.otr.cars[0].brand;
      this.otr.payload.model = this.otr.cars[0].model;
      this.otr.payload.location = this.otr.cars[0].location;
      this.otr.payload.status = this.otr.cars[0].status;
      this.formSave = true;
    },
    onCloseDialog() {
      this.otr.payload.title = null;
      this.formSave = false;
    },
    submitOTR() {
      this.otr.saveOTR().then((res) => {
        this.$q.notify({
          message: "OTR Successfully saved",
          color: "positive",
        });
        this.$refs.dialogOTR.resetValidation();
        this.formSave = false;
        this.panelOTR = false;
      });
    },
  },
  watch: {
    $route: {
      handler() {
        if (this.$route.path == "/otr") {
          this.isOTRPage = true;
        } else {
          this.isOTRPage = false;
        }
      },
      deep: true,
    },
  },
};
</script>
