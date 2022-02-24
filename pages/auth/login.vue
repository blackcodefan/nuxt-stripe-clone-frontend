<script>

import { mapActions } from 'vuex'


export default {
    head() {
        return {
            title: 'CRM MijnStalling | Login',
        };
    },
    data() {
        return {
            showValidationErrors: false,
            validationErrors: '',
            email: '',
            password: '',
            remember_me: 1,

        }
    },

    methods: {

        logout() {
          this.$auth.logout()
        },

        login() {

            this.$auth.loginWith('laravelSanctum', {
                data: {
                   email: this.email,
                   password: this.password,
                   remember_me: this.remember_me
               }
               })
              .then(() => this.$router.push('/'))
              .catch((
                {
                    response: {data : { error } } }) => {
                     this.validationErrors = error;
                     this.showValidationErrors = true
                 });

        },

    },

    layout: "auth",
};
</script>

<template>
<div class="row justify-content-center">
    <div class="col-md-8 col-lg-6 col-xl-5">
        <div class="card">
            <div class="card-body p-4">
                <div class="text-center m-auto">
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
                    <p class="text-muted mb-2 mt-3">{{ $t('login.intro.text') }}</p>

                      <b-alert :show="showValidationErrors" variant="danger">{{ this.validationErrors }}</b-alert>

                </div>

                <form @submit.prevent="login">
                    <div class="form-group mb-3">
                        <label for="emailaddress">{{ $t('global.email.text') }}</label>
                        <input class="form-control" v-model="email" type="email" id="emailaddress" required :placeholder="$t('global.email.text')" />
                    </div>

                    <div class="form-group mb-3">
                        <label for="password">{{ $t('global.password.text') }}</label>
                        <div class="input-group input-group-merge">
                            <input type="password" id="password" v-model="password" class="form-control" :placeholder="$t('global.password.text')" />
                        </div>
                    </div>

                    <div class="form-group mb-3">
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" v-model="remember_me" class="custom-control-input" id="checkbox-signin" checked />
                            <label class="custom-control-label" for="checkbox-signin">{{ $t('login.remember.text') }}</label>
                        </div>
                    </div>

                    <div class="form-group mb-0 text-center">
                        <button class="btn btn-primary btn-block" type="submit">{{ $t('login.login.text') }}</button>
                    </div>
                </form>

            </div>
            <!-- end card-body -->
        </div>
        <!-- end card -->

        <div class="row mt-3">
            <div class="col-12 text-center">
                <p>
                    <nuxt-link to="/auth/recoverpwd" class="text-muted ml-1">{{ $t('login.forgot_password.text') }}</nuxt-link>
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
