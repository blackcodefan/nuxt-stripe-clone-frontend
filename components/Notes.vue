<script>
import { BPagination } from "bootstrap-vue";
import { mapState } from "vuex";

export default {
  components: {},
  props: ["model_id", "model_type"],
  data() {
    return {
      isEditing: { note: "" },
      note: "",
      currentPage: 1,
    };
  },
  computed: {
    ...mapState({
      notes: (state) => {
        return state.notes.list;
      },
    }),
  },
  mounted() {
    this.getNotes();
  },
  methods: {
    changePage(page, a) {
      //console.log("changePage", page, a);
      this.getNotes(page);
    },
    getNotes(page_num) {
      page_num = page_num != undefined ? page_num : this.currentPage;
      this.$store.dispatch("notes/get", {
        model_id: this.model_id,
        model_type: this.model_type,
        page_num: page_num,
      });
    },
    addNote() {
      this.$store
        .dispatch("notes/create", {
          note: this.note,
          model_id: this.model_id,
          model_type: this.model_type,
        })
        .then((response) => {
          this.getNotes();
          this.note = "";
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
    editNote(note) {
      //console.log("editNote", note, this.isEditing);
      this.isEditing = { ...note };
    },
    updateNote() {
      this.$store
        .dispatch("notes/update", this.isEditing)
        .then((response) => {
          this.getNotes();
          this.isEditing = { note: "" };
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
    deleteNote(note) {
      this.$bvModal
        .msgBoxConfirm(this.$t("global.are_you_sure.text"), {
          cancelTitle: this.$t("global.cancel.text"),
        })
        .then((value) => {
          if (value) {
            this.$store
              .dispatch("notes/delete", note.uuid)
              .then((response) => {
                this.getNotes(1);
              })
              .catch((error) => {
                console.error(error.response);
              });
          }
        })
        .catch((err) => {
          // An error occurred
          console.error(err);
        });
    },
  },
};
</script>

<template>
  <div class="row">
    <div class="col">
      <div class="card">
        <div class="card-header bg-light">
            <h4 class="float-left text-orange">Notities</h4>
          </div>
        <div class="card-body">
          <b-pagination
            v-model="currentPage"
            v-if="notes.data && notes.data.length > 0"
            :total-rows="notes.total"
            :per-page="notes.per_page"
            align="right"
            @change="changePage"
          ></b-pagination>

          <div
            v-for="note in notes.data"
            :key="'note' + note.id"
            class="media mb-3"
          >
            <div class="media-body">
              <h5 class="mt-0">
                <span v-if="note.user">{{ note.user.firstname }}</span>
                <small class="text-muted float-right">
                  {{ note.created_at }}
                  <b-dropdown
                    class="conversation-actions"
                    toggle-class="btn-sm btn-link text-reset p-0"
                    variant="black"
                    right
                  >
                    <template v-slot:button-content>
                      <i class="mdi mdi-dots-vertical font-18"></i>
                    </template>
                    <span class="dropdown-item" @click="editNote(note)"
                      >Wijzig</span
                    >
                    <span class="dropdown-item" @click="deleteNote(note)"
                      >Verwijder</span
                    >
                  </b-dropdown>
                </small>
              </h5>

              <span v-show="note.id !== isEditing.id">{{ note.note }}</span>
              <textarea
                rows="3"
                class="form-control resize-none"
                v-model="isEditing.note"
                v-show="note.id == isEditing.id"
                v-on:keyup.enter="updateNote()"
              ></textarea>
            </div>
          </div>

          <div v-if="notes.data && !notes.data.length">
            <p>Er zijn nog geen notities.</p>
          </div>

          <div class="border rounded">
            <form @submit.prevent="addNote()" class="comment-area-box">
              <textarea
                rows="3"
                class="form-control border-0 resize-none"
                v-model="note"
                placeholder="Notitie.."
              ></textarea>
              <div
                class="p-2 bg-light d-flex justify-content-between align-items-center"
              >
                <button type="submit" class="btn btn-success">
                  {{ $t('global.save.text') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
