<script>
import { ModelListSelect } from "vue-search-select";
import { mapGetters } from "vuex";

export default {
  components: {
    ModelListSelect,
  },
  head() {
    return {
      title:
        "MijnStalling CRM | " +
        this.$tc("object.object.text", 2) +
        " | " +
        this.title,
    };
  },
  data() {
    return {
      title: this.$t("object.edit.text"),
      object: {},
      object_types: {},
      statuses: [
        { value: null, text: this.$t("global.unknown.text") },
        { value: 2, text: this.$t("object.in.text") },
        { value: 1, text: this.$t("object.out.text") },
      ],
      items: [
        {
          text: "Dashboard",
          to: "/",
        },
        {
          text: this.$tc("object.object.text", 2),
          to: "/objects",
        },
        {
          text: this.$tc("object.object.text", 1),
          to: { name: "objects-id", params: { id: this.$route.params.id } },
        },
        {
          text: this.$t("object.edit.text"),
          active: true,
        },
      ],
      validationErrors: "",
    };
  },

  computed: {
    customers() {
      return this.$store.getters["customers/customers"];
    },
  },

  mounted() {
    this.$store.dispatch("customers/getCustomers");

    this.$axios
      .get("api/objects/" + this.$route.params.id)
      .then((response) => {
        this.object = response.data.result;
      })
      .catch((error) => {
        alert(2);
      });

    this.$axios
      .get("api/object_types")
      .then((response) => {
        this.object_types = response.data.result;
      })
      .catch((error) => {
        alert(2);
      });
  },

  methods: {
    changeObject() {
      this.$axios
        .patch("api/objects/" + this.$route.params.id, this.object)
        .then((response) => {
          this.$bvModal.show("editObject");
        })
        .catch((error) => {
          this.validationErrors = error.response.data.errors;
        });
    },
  },
  middleware: "router-auth",
};
</script>

<template>
  <div>
    <PageHeader :items="items" />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-light">
            <h4 class="text-orange">{{ $t('object.edit.text') }}</h4>
          </div>
          <div class="card-body">
            <validation-errors
              :errors="validationErrors"
              v-if="validationErrors"
            ></validation-errors>

            <form
              class="form-horizontal"
              role="form"
              @submit.prevent="changeObject()"
            >
              <!--
                <b-form-group label-cols-sm="2" label-cols-lg="2" :label="this.$tc('customer.customer.text', 1)" label-for="customer">
                    <model-list-select :list="customers"
                          v-model="object.customer_id"
                          option-value="id"
                          option-text="email"
                          :placeholder="this.$t('global.make_a_choice.text')">
                      </model-list-select>
                </b-form-group>
              -->

              <b-form-group
                label-cols-sm="2"
                label-cols-lg="2"
                :label="this.$t('object.object_id.text')"
                label-for="object_id"
              >
                <b-form-input
                  id="object_id"
                  v-model="object.object_id"
                  :placeholder="this.$t('object.object_id.text')"
                ></b-form-input>
              </b-form-group>

              <b-form-group
                label-cols-sm="2"
                label-cols-lg="2"
                :label="this.$t('object.license_plate.text')"
                label-for="license_plate"
              >
                <b-form-input
                  for="license_plate"
                  v-model="object.license_plate"
                  :placeholder="this.$t('object.license_plate.text')"
                ></b-form-input>
              </b-form-group>

              <b-form-group
                label-cols-sm="2"
                label-cols-lg="2"
                :label="this.$t('object.spot.text')"
                label-for="spot"
              >
                <b-form-input
                  id="spot"
                  v-model="object.spot"
                  :placeholder="this.$t('object.spot.text')"
                ></b-form-input>
              </b-form-group>

              <b-form-group
                label-cols-sm="2"
                label-cols-lg="2"
                :label="this.$t('object.brand.text')"
                label-for="brand"
              >
                <b-form-input
                  id="brand"
                  v-model="object.brand"
                  :placeholder="this.$t('object.brand.text')"
                ></b-form-input>
              </b-form-group>

              <b-form-group
                label-cols-sm="2"
                label-cols-lg="2"
                label="Object type"
                label-for="object_type"
              >
                <b-form-select
                  v-model="object.object_type_id"
                  :options="this.object_types"
                  value-field="id"
                  text-field="name"
                ></b-form-select>
              </b-form-group>

              <b-form-group
                label-cols-sm="2"
                label-cols-lg="2"
                label="Type"
                label-for="type"
              >
                <b-form-input
                  id="type"
                  v-model="object.type"
                  placeholder="Type"
                ></b-form-input>
              </b-form-group>

              <b-form-group
                label-cols-sm="2"
                label-cols-lg="2"
                :label="this.$t('object.width.text')"
                label-for="width"
              >
                <b-form-input
                  id="width"
                  v-model="object.width"
                  :placeholder="this.$t('object.width.text')"
                ></b-form-input>
              </b-form-group>

              <b-form-group
                label-cols-sm="2"
                label-cols-lg="2"
                :label="this.$t('object.length.text')"
                label-for="length"
              >
                <b-form-input
                  id="length"
                  v-model="object.length"
                  :placeholder="this.$t('object.length.text')"
                ></b-form-input>
              </b-form-group>

              <b-form-group
                label-cols-sm="2"
                label-cols-lg="2"
                label="Status"
                label-for="status_id"
              >
                <b-form-select
                  v-if="object.status"
                  v-model="object.status.id"
                  :options="statuses"
                  value-field="value"
                  text-field="text"
                ></b-form-select>
              </b-form-group>

              <div class="form-group row">
                <label class="col-md-2 col-form-label"></label>
                <div class="col-md-8">
                  <input
                    type="submit"
                    :value="this.$t('global.save.text')"
                    class="btn btn-success"
                  />
                </div>
              </div>
            </form>

            <b-modal id="editObject" :title="$t('global.success.text')">
              <p>{{ $t("global.update_success.text") }}</p>
              <template #modal-footer>
                <b-button
                  variant="light"
                  @click="$router.push({ name: 'objects' })"
                >
                  {{ $t("global.overview.text") }}
                </b-button>

                <b-button
                  variant="success"
                  @click="
                    $router.push({
                      name: 'objects-id',
                      params: { id: object.uuid },
                    })
                  "
                >
                  {{ $t("global.details.text") }}
                </b-button>
              </template>
            </b-modal>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
