import moment from "moment/moment";
import { defineStore } from "pinia";
import { api } from "src/boot/axios";
const initalForm = {
  price: null,
  source_name: null,
  source_link: null,
};

function countUnique(arr) {
  const countObj = arr.reduce((result, val) => {
    result[val] = (result[val] || 0) + 1;
    return result;
  }, {});

  return Object.keys(countObj).map((key) => ({
    label: key,
    value: key,
    count: countObj[key],
  }));
}

const initalPayload = {
  title: null,
  description: null,
  brand: null,
  model: null,
  detail: [],
  fuel: null,
  status: null,
  depreciation: 0,
  location: null,
  source_name: "Credit SMF",
};

export const useOTRStore = defineStore("otr", {
  state: () => ({
    carList: [],
    carListUnsort: [],
    locations: [],
    expanded_location: false,
    expanded_source: false,
    lastSearch: "",
    sort: "",
    metadata: null,
    cars: [],
    otr: [],
    depreciation: 15,
    payload: { ...initalPayload },
    detailOTR: [],
    otrform: { ...initalForm },
    sourceList: [],
    source: [],
  }),

  getters: {
    getFoundNumber() {
      return this.metadata?.found
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    },
    getLocations() {
      let location = this.metadata?.location
        ? this.metadata?.location.map((e) => {
            return { label: e.label, count: e.count, value: e.label };
          })
        : [];
      if (location.length > 0) {
        this.expanded_location = true;
      } else {
        this.expanded_location = false;
      }
      return location;
    },
    getSum() {
      return this.cars
        .map((e) => e.price)
        .reduce((partial, a) => partial + a, 0);
    },
    getAverage() {
      // prettier-ignore
      return parseFloat(this.getSum / this.cars.length).toFixed(2);
    },
    getDepreciation() {
      // prettier-ignore
      return parseFloat(this.getAverage - this.getAverage * (this.depreciation / 100)).toFixed(2);
    },

    getSumOTR() {
      return this.detailOTR
        .map((e) => e.price)
        .reduce((partial, a) => partial + a, 0);
    },
    getAverageOTR() {
      // prettier-ignore
      return parseFloat(this.getSumOTR / this.detailOTR.length).toFixed(2);
    },
    getDepreciationOTR() {
      // prettier-ignore
      return parseFloat(this.getAverageOTR - this.getAverageOTR * (this.payload.depreciation / 100)).toFixed(2);
    },
    getPayload() {
      return {
        ...this.payload,
        detail: this.payload.detail.join(","),
        total: parseInt(this.getSumOTR),
        average: parseInt(this.getAverageOTR),
        price: parseInt(this.getDepreciationOTR),
        comparasion: this.detailOTR,
      };
    },
    getPayloadSave() {
      return {
        ...this.payload,
        detail: this.payload.detail.join(","),
        total: parseInt(this.getSum),
        average: parseInt(this.getAverage),
        price: parseInt(this.getAverage),
        depreciation: parseInt(this.depreciation),
        source_name: "Calculate",
        comparasion: this.cars.map((e) => {
          return {
            title: e.title,
            price: e.price,
            source_name: e.source_name,
            source_link: e.source_link,
          };
        }),
      };
    },
  },

  actions: {
    getOTR() {
      return api
        .get("/otr")
        .then((res) => {
          this.otr = res.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    saveOTR() {
      return api
        .post("/otr", this.getPayloadSave)
        .then((res) => {
          this.getOTR();
          this.resetForm();
          this.payload = { ...initalPayload };
          this.cars = [];
        })
        .catch((err) => {
          console.log(err);
        });
    },
    createOTR() {
      return api
        .post("/otr", this.getPayload)
        .then((res) => {
          this.getOTR();
          this.resetForm();
          this.payload = { ...initalPayload };
          this.detailOTR = [];
        })
        .catch((err) => {
          console.log(err);
        });
    },
    deleteOTR(id) {
      return api
        .delete("/otr/" + id)
        .then((res) => {
          this.getOTR();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    searchCars(query) {
      if (query) {
        return api
          .get("/search/" + query)
          .then((res) => {
            this.carList = res.data.data.sort((a, b) => {
              if (a.is_scraping && b.is_scraping) {
                if (this.sort == "") {
                  return moment(b.created_at).diff(moment(a.created_at));
                } else if (this.sort == "date-asc") {
                  return moment(a.created_at).diff(moment(b.created_at));
                } else if (this.sort == "price-asc") {
                  return a.price - b.price;
                } else if (this.sort == "price-desc") {
                  return b.price - a.price;
                }
              }
            });
            this.carListUnsort = this.carList;
            this.metadata = res.data.metadata;
            this.lastSearch = query;
            this.setFilterSource();
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        return new Promise((resolve, reject) => {
          this.carList = [];
          this.metadata = {};
          this.lastSearch = "";
          resolve(false);
        });
      }
    },
    sortCars() {
      this.carList = this.carList.sort((a, b) => {
        if (a.is_scraping && b.is_scraping) {
          if (this.sort == "") {
            return moment(b.created_at).diff(moment(a.created_at));
          } else if (this.sort == "date-asc") {
            return moment(a.created_at).diff(moment(b.created_at));
          } else if (this.sort == "price-asc") {
            return a.price - b.price;
          } else if (this.sort == "price-desc") {
            return b.price - a.price;
          }
        }
      });
    },
    setFilterSource() {
      this.sourceList = countUnique(
        this.carListUnsort.map((e) => e.source_name)
      );
      this.source = this.sourceList.map((e) => {
        return e.value;
      });
      if (this.source.length > 0) {
        this.expanded_source = true;
      } else {
        this.expanded_source = false;
      }
    },
    filterSource(state) {
      console.log(state);
      this.carList = this.carList.filter((e) => {
        return this.source.includes(e.source_name);
      });
    },
    filterLocation() {
      if (this.locations.length > 0) {
        this.carList = this.carList.filter((e) => {
          return this.locations.includes(e.location);
        });
      } else {
        this.carList = this.carListUnsort;
        this.sortCars();
      }
    },
    addCars(data, index) {
      let contain = this.containsCar(index);
      if (!contain) {
        this.cars.push(data);
      }
    },
    removeCars(index) {
      this.cars.splice(index, 1);
    },
    containsCar(idx) {
      var i;
      for (i = 0; i < this.cars.length; i++) {
        if (this.cars[i].id === idx) {
          this.removeCars(i);
          return true;
        }
      }
      return false;
    },
    resetForm() {
      this.otrform = { ...initalForm };
    },
    addUnit() {
      return new Promise((resolve, reject) => {
        this.detailOTR.push({
          ...this.otrform,
          created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        });
        this.resetForm();
        resolve();
      });
    },
    removeUnit(id) {
      this.detailOTR.splice(id, 1);
    },
  },
});
