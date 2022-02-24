<script>
/**
 * Topbar component
 */
export default {
    data() {
        return {
            languages: [
                {
                    flag: require("~/assets/images/flags/us.jpg"),
                    language: "en",
                    title: "English",
                },
                {
                    flag: require("~/assets/images/flags/french.jpg"),
                    language: "fr",
                    title: "French",
                },
                {
                    flag: require("~/assets/images/flags/spain.jpg"),
                    language: "es",
                    title: "Spanish",
                },
                {
                    flag: require("~/assets/images/flags/china.png"),
                    language: "zh",
                    title: "Chinese",
                },
                {
                    flag: require("~/assets/images/flags/arabic.png"),
                    language: "ar",
                    title: "Arabic",
                },
                {
                    flag: require("~/assets/images/flags/us.jpg"),
                    language: "nl",
                    title: "Netherlands",
                },
            ],
            current_language: this.$i18n.locale,
            text: null,
            flag: null,
            value: null,
        };
    },
    mounted() {
        this.value = this.languages.find((x) => x.language === this.$i18n.locale);
        this.text = this.value.title;
        this.flag = this.value.flag;
    },
    methods: {
        /**
         * Toggle menu
         */
        toggleMenu() {
            this.$parent.toggleMenu();
        },

        /**
         * Toggle rightbar
         */
        toggleRightSidebar() {
            this.$parent.toggleRightSidebar();
        },
        /**
         * Set languages
         */
        setLanguage(locale, country, flag) {
            this.$i18n.locale = locale;
            this.current_language = locale;
            this.text = country;
            this.flag = flag;
        },
        /**
         * Horizontal-toggle menu
         */
        horizonalmenu() {
            let element = document.getElementById("topnav-menu-content");
            element.classList.toggle("show");
        },
        /**
         * Logout user
         */
        logoutUser() {
            this.$auth.logout()
            this.$router.go('/auth/login')
        },
    },
};
</script>

<template>
<!-- Topbar Start -->
<div class="navbar-custom">
    <div class="container-fluid">
        <ul class="list-unstyled topnav-menu float-right mb-0">

            <b-nav-item-dropdown right class="notification-list topbar-dropdown" menu-class="profile-dropdown" toggle-class="p-0">
                <template slot="button-content" class="nav-link dropdown-toggle">
                    <div class="nav-user mr-0">
                        <!--<img src="~/assets/images/users/avatar-1.jpg" alt="user-image" class="rounded-circle" />-->
                        <span class="pro-user-name ml-1">
                            {{ this.$auth.user.firstname }}
                            <i class="mdi mdi-chevron-down"></i>
                        </span>
                    </div>
                </template>

                <!--
                <b-dropdown-item href="#">
                    <span>{{ $t('navbar.dropdown.name.list.account') }}</span>
                </b-dropdown-item>

                <b-dropdown-item href="#">
                    <span>{{ $t('navbar.dropdown.name.list.settings') }}</span>
                </b-dropdown-item>
                -->

                <b-dropdown-item :to="{name: 'account-password'}">
                    <span>Wijzig wachtwoord</span>
                </b-dropdown-item>


                <b-dropdown-item href="#" @click="logoutUser">
                    <span>{{ $t('global.logout.text') }}</span>
                </b-dropdown-item>

            </b-nav-item-dropdown>

        </ul>

        <ul class="list-unstyled topnav-menu topnav-menu-left m-0">
            <li>
                <button class="button-menu-mobile waves-effect waves-light" @click="toggleMenu">
                    <i class="fe-menu"></i>
                </button>
            </li>

            <li>
                <!-- Mobile menu toggle (Horizontal Layout)-->
                <a class="navbar-toggle nav-link" data-toggle="collapse" @click="horizonalmenu()" data-target="#topnav-menu-content">
                    <div class="lines">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </a>
                <!-- End mobile menu toggle-->
            </li>

        </ul>
        <div class="clearfix"></div>
    </div>
</div>
<!-- end Topbar -->
</template>
