<template>
  <q-page class="tw-p-4">
    <q-btn
      label="Home"
      icon="arrow_back_ios"
      no-caps
      dense
      flat
      to="/"
      color="primary"
    />
    <q-table
      title="List OTR"
      flat
      class="tw-mt-4"
      :rows="otr.otr"
      :columns="columns"
      :loading="loading"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:top-right>
        <q-input placeholder="Search...." v-model="filter" dense filled>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:header="props">
        <q-tr :props="props" class="tw-text-xs tw-text-gray-400 tw-bg-gray-50">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            class="tw-p-2 tw-whitespace-nowrap !tw-font-semibold"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body-cell-total="props">
        <q-td :props="props">
          {{ idr(props.row.total) }}
        </q-td>
      </template>
      <template v-slot:body-cell-depreciation="props">
        <q-td :props="props"> {{ props.row.depreciation }}% </q-td>
      </template>
      <template v-slot:body-cell-price="props">
        <q-td :props="props">
          {{ idr(props.row.price) }}
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="tw-flex tw-justify-center tw-gap-2">
            <q-btn
              icon="edit"
              color="primary"
              disable
              dense
              size="sm"
              unelevated
            />
            <q-btn
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row.id)"
              dense
              size="sm"
              unelevated
            />
          </div>
        </q-td>
      </template>
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
    </q-table>
  </q-page>
  <q-dialog v-model="confirmation">
    <q-card style="width: 400px">
      <q-card-section class="bg-negative">
        <div class="text-h6 text-white">Confirmation</div>
      </q-card-section>

      <q-card-section> Are you sure want delete this data? </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="No" color="grey-9" v-close-popup />
        <q-btn
          flat
          label="Yes"
          color="negative"
          @click="deleteOTR"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent, ref } from "vue";
import { useOTRStore } from "src/stores/otr";
import moment from "moment";
const columns = [
  {
    name: "title",
    field: "title",
    label: "Unit Name",
    align: "left",
  },
  {
    name: "total",
    field: "total",
    label: "Total",
    align: "left",
  },
  {
    name: "depreciation",
    field: "depreciation",
    label: "Depreciation",
    align: "left",
  },
  {
    name: "price",
    field: "price",
    label: "Price",
    align: "left",
  },
  {
    name: "location",
    field: "location",
    label: "Location",
    align: "left",
  },
  {
    name: "created_at",
    field: (row) => moment(row.created_at_string).format("YYYY-MM-DD HH:mm:ss"),
    label: "Created At",
    align: "left",
  },
  {
    name: "action",
    label: "Action",
    align: "center",
  },
];

export default defineComponent({
  setup() {
    const otr = useOTRStore();
    return {
      otr,
      columns,
      ID: ref(null),
      confirmation: ref(false),
      loading: ref(false),
    };
  },
  mounted() {
    this.loading = true;
    this.otr.getOTR().then((res) => {
      this.loading = false;
    });
  },
  methods: {
    idr(val) {
      return (
        "Rp. " + val.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1\.")
      );
    },
    confirmDelete(id) {
      this.ID = id;
      this.confirmation = true;
    },
    deleteOTR() {
      this.otr.deleteOTR(this.ID).then((res) => {
        this.otr.getOTR();
        this.$q.notify({
          color: "positive",
          message: "OTR Successfully deleted",
        });
      });
    },
  },
});
</script>
