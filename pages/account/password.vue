<script>

export default {

    head() {
        return {
            title: 'MijnStalling CRM | Wijzig je wachtwoord',
        }
    },
    data() {
        return {
            title: 'Wijzig je wachtwoord',
            items: [{
                    text: 'Dashboard',
                    to: '/',
                },
                {
                    text: 'Wijzig je wachtwoord',
                    active: true,
                },
            ],
            passwords: {},
            validationErrors: '',
            showAlert: false,
            updateSuccess: ''
        }
    },



    mounted () {



    },

    methods: {

        editPassword() {

            this.$axios
                .put('/api/password', {
                    password_current: this.passwords.old,
                    password: this.passwords.new,
                    password_confirm: this.passwords.confirmation,
                })
                .then((response) => {
                    this.updateSuccess = 'Wachtwoord is met succes gewijzigd';
                    this.showAlert = true
                    this.validationErrors = '';
                    this.passwords = '';
                })
                .catch((error) => {
                    this.validationErrors = error.response.data.errors;
                })

        }

    },
    middleware: 'router-auth'
}
</script>

<template>
<div>
    <PageHeader :title="title" :items="items" />

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">

                    <validation-errors :errors="validationErrors" v-if="validationErrors"></validation-errors>

                    <b-alert variant="success" v-model="showAlert">{{ this.updateSuccess }}</b-alert>

                    <form class="form-horizontal" role="form" @submit.prevent="editPassword()">

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('login.current_password.text')" label-for="name">
                            <b-form-input type="password" v-model="passwords.old"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('login.new_password.text')" label-for="name">
                            <b-form-input type="password" v-model="passwords.new"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('login.new_password_repeat.text')" label-for="name">
                            <b-form-input type="password" v-model="passwords.confirmation"></b-form-input>
                        </b-form-group>

                        <div class="form-group row">
                            <label class="col-md-2 col-form-label"></label>
                            <div class="col-md-8">
                                <input type="submit" :value="$tc('global.edit.text')" class="btn btn-success">
                            </div>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    </div>

</div>
</template>
