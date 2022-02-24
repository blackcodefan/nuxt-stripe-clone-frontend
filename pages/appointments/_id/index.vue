<script>
/**
 * Basic Tables component
 */
export default {
  head() {
    return {
      title:
        "MijnStalling CRM | " + this.$tc("appointment.appointment.text", 1),
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
          text: this.$tc("appointment.appointment.text", 2),
          to: "/appointments",
        },
        {
          text: this.$tc("appointment.appointment.text", 1),
          active: true,
        },
      ],
      appointment: {
        object: {
          customer: {},
        },
      },
      isEditing: null,
    };
  },
  computed: {
    title() {
      return this.appointment.object.object_id;
    },
    //appointment() {
    //  return this.$store.getters['appointments/getById'](this.$route.params.id)
    //}
  },
  async asyncData({ params, $axios }) {
    const response = await $axios.get(`api/appointments/${params.id}`);
    return { appointment: response.data.result };
  },
  mounted() {},
  methods: {
    getAppointment() {
      this.$axios
        .get("api/appointments/" + this.$route.params.id)
        .then((response) => {
          this.appointment = response.data.result;
        })
        .catch(() => {});
    },

    deleteAppointment(appointment) {
      this.$bvModal
        .msgBoxConfirm(this.$t("global.are_you_sure.text"), {
          cancelTitle: this.$t("global.cancel.text"),
        })
        .then((value) => {
          if (value) {
            this.$store.dispatch("appointments/deleteAppointment", appointment);
            this.$router.push({ name: "appointments" });
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
          model_type: "App\\Models\\Appointment",
          model_id: this.appointment.id,
        })
        .then((response) => {
          this.getAppointment();
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
                this.getAppointment();
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

    <div class="row">
      <div class="col-lg-12">

        <!-- afspraak info -->
        <div class="card">

        <div class="card-header bg-light">
            <h4 class="float-left text-orange">Afspraakinformatie</h4>
            <div class="float-sm-right">
              <nuxt-link
                :to="{ name: 'appointments-id-edit' }"
                class="btn btn-warning"
                ><i class="mdi mdi-circle-edit-outline mr-2"></i>
                {{ $t("appointment.edit.text") }}</nuxt-link
              >
              <span
                class="btn btn-danger"
                @click="deleteAppointment(appointment)"
                ><i class="mdi mdi-delete-circle-outline mr-2"></i>
                {{ $t("global.delete.text") }}</span
              >
            </div>
        </div>

          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="firstname">{{ $t("global.date.text") }}</label>
                  <div>{{ this.appointment._appointment_at }}</div>
                </div>
              </div>
              <div class="col-md-6" v-if="this.appointment.status">
                <div class="form-group">
                  <label for="firstname">Status</label>
                  <div>
                    <span :class="this.appointment.status.class">{{
                      this.appointment.status.name
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6" v-if="this.appointment.note">
                <div class="form-group">
                  <label for="firstname">{{ $t("global.note.text") }}</label>
                  <div>{{ this.appointment.note }}</div>
                </div>
              </div>

              <div class="col-md-6" v-if="this.appointment.type">
                <div class="form-group">
                  <label for="firstname">Type</label>
                  <div>{{ this.appointment.type.name }}</div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="firstname">{{
                    $t("global.created_at.text")
                  }}</label>
                  <div>{{ this.appointment.created_at }}</div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label for="firstname">{{
                    $t("global.updated_at.text")
                  }}</label>
                  <div>{{ this.appointment.updated_at }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- end card -->
      </div>
      <!-- end col -->
    </div>

    <!--  object info -->
    <div class="card">
      <div class="card-header bg-light">
        <h4 class="float-left text-orange">Objectinformatie</h4>
          <div class="float-sm-right">
            <nuxt-link
              :to="{name: 'objects-id', params: {id: this.appointment.object.uuid}}"
              class="float-right btn btn-primary"
            >
              Bekijk object
            </nuxt-link>
          </div>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="firstname">{{
                  $t("object.license_plate.text")
                }}</label>
              <div>{{ this.appointment.object.license_plate }}</div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="firstname">{{ $t("object.brand.text") }}</label>
              <div>
                {{ this.appointment.object.brand }}
                {{ this.appointment.object.type }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--  object info -->

    <!-- klant info -->
    <div class="card">
      <div class="card-header bg-light">
        <h4 class="float-left text-orange">Klantinformatie</h4>
        <div class="float-sm-right">
          <nuxt-link
            :to="{name: 'customers-id', params: {id: this.appointment.object.customer.uuid}}"
            class="float-right btn btn-primary"
          >
            Bekijk klant
          </nuxt-link>

        </div>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6" v-if="this.appointment.object">
            <div class="form-group">
              <label for="firstname">{{ $t("global.name.text") }}</label>
              <div>{{ this.appointment.object.customer.full_name }}</div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6" v-if="this.appointment.object">
            <div class="form-group">
              <label for="firstname">{{ $t("global.email.text") }}</label>
              <div>
                {{ this.appointment.object.customer.email }}
                <a
                  class="badge badge-outline-primary badge-secondary"
                  :href="'mailto:' + this.appointment.object.customer.email"
                >Stuur email</a
                >
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="firstname">{{ $t("global.phone.text") }}</label>
              <div>{{ this.appointment.object.customer.phone }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- klant info -->

    <!--- end row -->

    <!-- notes -->
    <Notes
      :model_id="appointment.id"
      model_type="App\Models\Appointment"
    ></Notes>
    <!-- notes -->
  </div>
</template>
