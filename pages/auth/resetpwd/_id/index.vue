<script>
/**
 * Recoverpwd-2 component
 */
export default {
    auth: false,
    head() {
        return {
            title: 'CRM MijnStalling | ' + this.$t('login.reset_password.text'),
        }
    },
    data() {
        return {
            email: '',
            password: '',
            password_repeat: '',
            updateSuccess: '',
            validationErrors: ''
        };
    },
    methods: {
        resetPassword() {

            this.$axios
                .post('/password/reset', {
                    token: this.$route.params.id,
                    email: this.email,
                    password: this.password,
                    password_confirmation: this.password_repeat
                })
                .then(response => {
                    this.$router.push({name: 'auth-login'})
                })
                .catch(error => {
                    this.validationErrors = error.response.data.errors;
                })

        }
    },
    layout: "auth",
};
</script>

<template>
<div class="row justify-content-center">
    <div class="col-md-8 col-lg-6 col-xl-5">
        <div class="card">
            <div class="card-body p-4">
                <div class="text-center w-75 m-auto">
                    <div class="auth-logo">
                        <nuxt-link to="/" class="logo logo-dark text-center">
                            <span class="logo-lg">
                                <!--<img src="~/assets/images/logo-dark.png" alt height="22" />-->
                                <span style="font-weight: bold; font-size: 20px;">CRM MijnStalling</span>
                            </span>
                        </nuxt-link>

                        <nuxt-link to="/" class="logo logo-light text-center">
                            <span class="logo-lg">
                                <img src="~/assets/images/logo-light.png" alt height="22" />
                            </span>
                        </nuxt-link>
                    </div>
                    <p class="text-muted mb-4 mt-3">{{ this.$t('login.reset_intro.text') }}</p>
                </div>

                <validation-errors :errors="validationErrors" v-if="validationErrors"></validation-errors>

                <form @submit.prevent="resetPassword">
                    <div class="form-group mb-3">
                        <label for="emailaddress">{{ this.$t('global.email.text') }}</label>
                        <input class="form-control" v-model="email" type="email" id="emailaddress" required :placeholder="this.$t('global.email.text')" />
                    </div>

                    <div class="form-group mb-3">
                        <label for="password">{{ this.$t('login.new_password.text') }}</label>
                        <input class="form-control" v-model="password" type="password" id="password" required :placeholder="this.$t('login.new_password.text')" />
                    </div>

                    <div class="form-group mb-3">
                        <label for="password_repeat">{{ this.$t('login.new_password_repeat.text') }}</label>
                        <input class="form-control" v-model="password_repeat" type="password" id="password_repeat" required :placeholder="this.$t('login.new_password_repeat.text')" />
                    </div>

                    <div class="form-group mb-0 text-center">
                        <button class="btn btn-primary btn-block" type="submit">{{ this.$t('login.reset_password.text') }}</button>
                    </div>
                </form>
            </div>
            <!-- end card-body -->
        </div>
        <!-- end card -->

        <div class="row mt-3">
            <div class="col-12 text-center">
                <p class="text-muted">
                    <nuxt-link to="/auth/login" class="text-primary font-weight-medium ml-1">{{ this.$t('login.login.text') }}</nuxt-link>
                </p>
            </div>
            <!-- end col -->
        </div>
        <!-- end row -->
    </div>
    <!-- end col -->
</div>
<!-- end row -->
</template>
