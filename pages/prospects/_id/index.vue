<script>
/**
 * Basic Tables component
 */
export default {
  head() {
    return {
      title: "MijnStalling CRM | " + this.$tc("prospect.prospect.text", 2),
    };
  },
  data() {
    return {
      items: [
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: this.$tc("prospect.prospect.text", 2),
          to: { name: "prospects" },
        },
        {
          text: this.$tc("prospect.prospect.text", 1),
          active: true,
        },
      ],
      prospect: "",
      isEditing: null,
    };
  },
  computed: {
    title() {
      return this.prospect.firstname;
    },
  },
  async asyncData({ params, $axios }) {
    const response = await $axios.get(`api/prospects/${params.id}`);
    return { prospect: response.data.result };
  },
  mounted() {},
  methods: {
    getProspect() {
      this.$axios
        .get("api/prospects/" + this.$route.params.id)
        .then((response) => {
          this.prospect = response.data.result;
        })
        .catch(() => {});
    },

    deleteProspect(prospect) {
      this.$bvModal
        .msgBoxConfirm(this.$t("global.are_you_sure.text"), {
          cancelTitle: this.$t("global.cancel.text"),
        })
        .then((value) => {
          if (value) {
            this.$store.dispatch("prospects/deleteProspect", prospect);
            this.$router.push({ name: "prospects" });
          }
        })
        .catch((err) => {
          // An error occurred
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
      <div class="col-lg-12">

        <div class="alert alert-warning" role="alert" v-if="this.prospect.object">
          Deze inschrijving is al omgezet naar object/klant. <nuxt-link :to="{name: 'objects-id', params: {id: this.prospect.object.uuid}}">Klik hier om het object te openen.</nuxt-link>
        </div>
        
        <div class="card">

          <div class="card-header bg-light">

            <h4 class="float-left text-orange">Klantinformatie</h4>

                <div class="float-sm-right">
                  <nuxt-link

                    :to="{ name: 'prospects-id-convert' }"
                    class="btn btn-success"
                    ><i class="mdi mdi-plus-circle mr-2"></i>
                    {{ $t("prospect.convert.text") }}</nuxt-link
                  >
                  <nuxt-link

                    :to="{ name: 'prospects-id-edit' }"
                    class="btn btn-warning"
                    ><i class="mdi mdi-circle-edit-outline mr-2"></i>
                    {{ $t("prospect.edit.text") }}</nuxt-link
                  >
                  <span
                    class="btn btn-danger"
                    @click="deleteProspect(prospect)"
                    ><i class="mdi mdi-delete-circle-outline mr-2"></i>
                    {{ $t("global.delete.text") }}</span
                  >
                </div>

        </div>

          <div class="card-body">

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="firstname">{{ $t("global.name.text") }}</label>
                  <div>
                    {{ this.prospect.firstname }} {{ this.prospect.lastname }}
                  </div>
                </div>
              </div>
              <div class="col-md-6" v-if="this.prospect.status">
                <div class="form-group">
                  <label for="firstname">Status</label>
                  <div>
                    <span :class="this.prospect.status.class">{{
                      this.prospect.status.name
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="firstname">{{ $t("global.email.text") }}</label>
                  <div>
                  {{ this.prospect.email }}
                  <a
                    class="badge badge-outline-primary badge-secondary"
                    :href="'mailto:' + this.prospect.email"
                    >Stuur email</a>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-group">
                  <label for="firstname">{{ $t("global.phone.text") }}</label>
                  <div>{{ this.prospect.phone }}</div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="firstname">{{ $t("global.address.text") }}</label>
                  <div>
                    {{ this.prospect.street }} {{ this.prospect.number }}
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-group">
                  <label for="firstname"
                    >{{ $t("global.zipcode.text") }} /
                    {{ $t("global.city.text") }}</label
                  >
                  <div>
                    {{ this.prospect.zipcode }} {{ this.prospect.city }}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <!-- end card -->

    <!-- object info -->

    <div class="card">
      <div class="card-header bg-light">
        <h4 class="float-left text-orange">Objectgegevens</h4>
      </div>

          <div class="card-body">
                          <div class="row">
                            <div class="col-md-6">
                              <div class="form-group" v-if="this.prospect.object_type">
                                <label for="firstname">Object type</label>
                                <div>{{ this.prospect.object_type.name }}</div>
                              </div>
                            </div>

                            <div class="col-md-6">
                              <div class="form-group">
                                <label for="firstname">{{ $t("object.brand.text") }}</label>
                                <div>{{ this.prospect.brand }} {{ this.prospect.type }}</div>
                              </div>
                            </div>
                          </div>

                          <div class="row">
                            <div class="col-md-6">
                              <div class="form-group">
                                <label for="firstname">{{
                                  $t("object.license_plate.text")
                                }}</label>
                                <div>{{ this.prospect.license_plate }}</div>
                              </div>
                            </div>

                            <div class="col-md-6">
                              <div class="form-group">
                                <label for="firstname">{{
                                  $t("prospect.expected_date.text")
                                }}</label>
                                <div>{{ this.prospect.delivery_at }}</div>
                              </div>
                            </div>
                          </div>

                          <div class="row">
                            <div class="col-md-6">
                              <div class="form-group">
                                <label for="firstname">{{ $t("object.width.text") }}</label>
                                <div>{{ this.prospect.width }}</div>
                              </div>
                            </div>

                            <div class="col-md-6">
                              <div class="form-group">
                                <label for="firstname">{{ $t("object.length.text") }}</label>
                                <div>{{ this.prospect.length }}</div>
                              </div>
                            </div>
                          </div>
            </div>

    </div>


    <!-- object info -->

      </div>
      <!-- end col -->
    </div>
    <!--- end row -->



    <!-- notes -->
    <Notes :model_id="prospect.id" model_type="App\Models\Prospect"></Notes>
    <!-- notes -->
  </div>
</template>
