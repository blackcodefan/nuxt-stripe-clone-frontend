export default {
  loading: "~/components/Loading.vue",
  router: {
    extendRoutes(routes) {
      routes.push({
        path: "/",
        component: "~/pages/dashboard/index.vue"
      });
    },
    middleware: ['auth']
  },
  /*
  ** Nuxt rendering mode
  ** See https://nuxtjs.org/api/configuration-mode
  */
  mode: 'spa',
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'server',
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    title: 'Mijnstalling',
    //title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      },
      {
        rel: 'apple-touch-icon',
        type: 'image/jpg',
        href: '/apple-touch-icon.jpg'
      }
    ]
  },
  /*
  ** Global CSS
  */
  css: ["~/assets/scss/app.scss", 'quill/dist/quill.core.css', 'quill/dist/quill.snow.css', 'quill/dist/quill.bubble.css'],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
    //"~/plugins/fireauth.js",
    // "~/plugins/auth.js",
    //"~/plugins/fakeauth.js",
    //"~/plugins/simplebar.js",
    "~/plugins/vue-click-outside.js",
    "~/plugins/vuelidate.js",
    //"~/plugins/draggable.js",
    //"~/plugins/vue-slidebar.js",
    //"~/plugins/tour.js",
    //"~/plugins/vue-lightbox.js",
    "~/plugins/mask.js",
    //"~/plugins/quill-editor.js",
    //"~/plugins/chartist.js",
    //"~/plugins/vue-googlemap.js",
    "~/plugins/string-filter",
    "~/plugins/vue-search-select.js",
    "~/plugins/datetimepicker.js",
    "~/plugins/datetime.js",
    "~/plugins/ctk-datetimepicker.js",
    "~/plugins/vue-good-table",
    "~/plugins/vue-select",
    '~/plugins/lodash.js'
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: true,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxtjs/moment'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    'nuxt-i18n',
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/proxy'
  ],
  bootstrapVue: {
    // Install the `IconsPlugin` plugin (in addition to `BootstrapVue` plugin)
    icons: true
  },

  axios: {
    //proxy: true,
    baseURL: process.env.API_URL,
    withCredentials: true,
    credentials: true,
    headers: {
      common: {
        'X-localization': 'nl'
      }
    }
  },

  proxy: {
    '/laravel': {
      target: process.env.API_URL,
      pathRewrite: { '^/laravel': '/' }
    }
  },

  auth: {
    redirect: {
      login: '/auth/login',
      logout: '/auth/login',
      callback: false,
      home: '/'
    },

    strategies: {

      'laravelSanctum': {
        provider: 'laravel/sanctum',
        url: process.env.API_URL,
        endpoints: {
          logout: { url: '/logout', method: 'post' },
          user: { url: '/api/user', method: 'get', propertyName: false }
        },
        user: {
          property: 'data'
        }
      }

    },
    localStorage: false
  },
  i18n: {
    strategy: 'no_prefix',
    locales: ['en', 'nl'],
    //locales: ['en', 'fr', 'es', 'ar'],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      messages: {
        en: require('./locales/en.json'),
        nl: require('./locales/nl.json')
        // fr: require('./locales/fr.json'),
        // es: require('./locales/es.json'),
        // ar: require('./locales/ar.json'),
        // zh: require('./locales/zh.json')
      }
    }
  },
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
  },
  env: {
    auth: process.env.VUE_APP_DEFAULT_AUTH,
    apikey: process.env.VUE_APP_APIKEY,
    authdomain: process.env.VUE_APP_AUTHDOMAIN,
    databaseurl: process.env.VUE_APP_DATABASEURL,
    projectid: process.env.VUE_APP_PROJECTId,
    storgebucket: process.env.VUE_APP_STORAGEBUCKET,
    message: process.env.VUE_APP_MESSAGINGSENDERID,
    appid: process.env.VUE_APP_APPId,
    measurement: process.env.VUE_APP_MEASUREMENTID
  }
}

