<script>
import { mapActions } from "vuex";

export default {
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
      items: [
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: this.$tc("object.object.text", 2),
          to: "/objects",
        },
        {
          text: "Object",
          active: true,
        },
      ],
      object: "",
      note: "",
      isEditing: null,
      appointment_type:["","Out","In"],
      appointment_class:[
        "","text-danger","","text-success"
      ]
    };
  },
  computed: {
    title() {
      return this.object.object_id;
    },
  },
  async asyncData({ params, $axios }) {
    const response = await $axios.get(`api/objects/${params.id}`);
    return { object: response.data.result };
  },
  // mounted() {
  //   this.getObject();
  // },

  methods: {
    getObject() {
      this.$axios
        .get("api/objects/" + this.$route.params.id)
        .then((response) => {
          this.object = response.data.result;
          console.log(this.object);
        })
        .catch(() => {});
    },

    deleteObject(object) {
      this.$bvModal
        .msgBoxConfirm(this.$t("global.are_you_sure.text"), {
          cancelTitle: this.$t("global.cancel.text"),
        })
        .then((value) => {
          if (value) {
            this.$store.dispatch("objects/deleteObject", object);
            this.$router.push({ name: "objects" });
          }
        })
        .catch((err) => {
          // An error occurred
        });
    },

    addNote() {
      this.$axios
        .post("api/notes", {
          note: this.note,
          model_type: "App\\Models\\CustomerObject",
          model_id: this.object.id,
        })
        .then((response) => {
          this.getObject();
          this.note = "";
        })
        .catch((error) => {
          console.log(error.response);
        });
    },

    deleteNote(note) {
      this.$bvModal
        .msgBoxConfirm(this.$t("global.are_you_sure.text"), {
          cancelTitle: this.$t("global.cancel.text"),
        })
        .then((value) => {
          if (value) {
            this.$axios
              .delete("api/notes/" + note.id)
              .then((response) => {
                this.getObject();
              })
              .catch((error) => {
                console.log(error.response);
              });
          }
        })
        .catch((err) => {
          // An error occurred
        });
    },

    editNote(note) {
      this.isEditing = note;
    },

    updateNote(note) {
      this.$axios
        .patch("api/notes/" + note.id, note)
        .then((response) => {
          this.isEditing = null;
        })
        .catch((error) => {
          console.log(error.response);
        });
    },
  },

  middleware: "router-auth",
};
</script>

<template>
  <div>
    <PageHeader :items="items" />

    <!-- object info -->
    <div class="row">
      <div class="col-lg-12">
        <div class="card">

        <div class="card-header bg-light">
            <h4 class="float-left text-orange">Objectinformatie</h4>
            <div class="float-sm-right">
              <nuxt-link
                :to="{ name: 'objects-id-edit' }"
                class="btn btn-warning"
                ><i class="mdi mdi-circle-edit-outline mr-2"></i>
                {{ this.$t("object.edit.text") }}</nuxt-link
              >
              <span class="btn btn-danger" @click="deleteObject(object)"
                ><i class="mdi mdi-delete-circle-outline mr-2"></i>
                {{ $t("global.delete.text") }}</span
              >
            </div>
        </div>

          <div class="card-body">
            <div class="table-responsive">
              <table class="table mb-0">
                <tbody>
                    <tr>
                    <td class="font-weight-bold">{{ this.$t("object.object_id.text") }}</td>
                    <td>{{ this.object.object_id }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">{{ this.$t("object.license_plate.text") }}</td>
                    <td>{{ this.object.license_plate }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">{{ this.$t("object.spot.text") }}</td>
                    <td>{{ this.object.spot }}</td>
                  </tr>
                  <tr v-if="this.object.object_type">
                    <td class="font-weight-bold">Object</td>
                    <td>{{ this.object.object_type.name }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">{{ this.$t("object.brand.text") }}</td>
                    <td>{{ this.object.brand }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">Type</td>
                    <td>{{ this.object.type }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">{{ this.$t("object.width.text") }}</td>
                    <td>{{ this.object.width }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">{{ this.$t("object.length.text") }}</td>
                    <td>{{ this.object.length }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">Status</td>
                    <td>{{ this.object.status.name }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- object info -->

    <!-- customer info -->
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
        <div class="card-header bg-light">
            <h4 class="float-left text-orange">Klantinformatie</h4>
            <div class="float-sm-right" v-if="this.object">
              <nuxt-link
                :to="{
                  name: 'customers-id',
                  params: { id: this.object.customer.uuid },
                }"
                class="btn btn-primary"
                ><i class="mdi mdi-account-circle-outline mr-2"></i>
                {{ this.$t("customer.show.text") }}</nuxt-link
              >
              <nuxt-link
                :to="{
                  name: 'customers-id-edit',
                  params: { id: this.object.customer.uuid },
                }"
                class="btn btn-warning"
                ><i class="mdi mdi-circle-edit-outline mr-2"></i>
                {{ this.$t("customer.edit.text") }}</nuxt-link
              >
            </div>
        </div>
          <div class="card-body">
            <div class="table-responsive" v-if="object.customer">
              <table class="table mb-0">
                <tbody>
                  <tr>
                    <td class="font-weight-bold">{{ this.$t("global.name.text") }}</td>
                    <td>{{ this.object.customer.full_name }}</td>
                  </tr>

                  <tr>
                    <td class="font-weight-bold">{{ this.$t("global.email.text") }}</td>
                    <td>
                      {{ this.object.customer.email }}
                      <a
                        class="badge badge-outline-primary badge-secondary"
                        :href="'mailto:' + this.object.customer.email"
                        >Stuur email</a
                      >
                    </td>
                  </tr>

                  <tr>
                    <td class="font-weight-bold">{{ this.$t("global.phone.text") }}</td>
                    <td>{{ this.object.customer.phone }}</td>
                  </tr>

                  <tr>
                    <td class="font-weight-bold">{{ this.$t("global.address.text") }}</td>
                    <td>
                      {{ this.object.customer.street }}
                      {{ this.object.customer.number }}
                    </td>
                  </tr>

                  <tr>
                    <td class="font-weight-bold">
                      {{ this.$t("global.zipcode.text") }} /
                      {{ this.$t("global.city.text").toLowerCase() }}
                    </td>
                    <td>
                      {{ this.object.customer.zipcode }}
                      {{ this.object.customer.city }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- customer info -->

    <!-- appointment history -->
     <div class="row" v-if="object.appointments && object.appointments.length">
      <div class="col-lg-12">
        <div class="card">

        <div class="card-header bg-light">
            <h4 class="float-left text-orange">Afspraakgeschiedenis</h4>
        </div>

          <div class="card-body">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead class="bg-light">
                  <tr>
                    <th>{{ $t("global.date.text") }}</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(appointment, index) of object.appointments" :key="index">
                    <td>
                      <nuxt-link
                        :to="{ name: 'appointments-id', params: {id: appointment.uuid} }"
                        >{{ appointment.appointment_at }}</nuxt-link>
                    </td>
                    <td>{{ appointment.type.name }}</td>
                    <td><span :class="appointment.status.class">{{ appointment.status.name }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- appointment history -->
    <!-- notes -->
    <Notes :model_id="object.id" model_type="App\Models\CustomerObject"></Notes>
    <!-- notes -->
  </div>
</template>
