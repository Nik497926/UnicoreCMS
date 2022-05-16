import mainConfig from './main.config'
import { envConfig } from 'unicore-common/dist/envconfig'
const WebpackObfuscator = require('webpack-obfuscator');

export default mainConfig({
  ssr: false,

  head: {
    titleTemplate: '%s - UnicoreCMS',
    title: 'Панель управления',
  },

  server: {
    port: envConfig.adminPort,
  },

  plugins: ['~/plugins/primevue', '~/plugins/axios'],

  css: ['primeflex/primeflex.css', '~/assets/styles/layout.scss'],

  auth: {
    redirect: {
      login: '/login',
      logout: '/login',
      home: '/',
    },
  },

  primevue: {
    theme: 'vela-purple',
    ripple: true,
    components: [
      'AutoComplete',
      'Accordion',
      'AccordionTab',
      'Avatar',
      'AvatarGroup',
      'Badge',
      'Button',
      'Breadcrumb',
      'Calendar',
      'Card',
      'Carousel',
      'Chart',
      'Checkbox',
      'Chip',
      'Chips',
      'ColorPicker',
      'Column',
      'ConfirmDialog',
      'ConfirmPopup',
      'ContextMenu',
      'ImagePreview',
      'DataTable',
      'DataView',
      'DataViewLayoutOptions',
      'Dialog',
      'Divider',
      'Dropdown',
      'Fieldset',
      'FileUpload',
      'InlineMessage',
      'Inplace',
      'InputMask',
      'InputNumber',
      'InputSwitch',
      'InputText',
      'Knob',
      'Galleria',
      'Listbox',
      'MegaMenu',
      'Menu',
      'Menubar',
      'Message',
      'MultiSelect',
      'OrderList',
      'OrganizationChart',
      'OverlayPanel',
      'Paginator',
      'Panel',
      'PanelMenu',
      'Password',
      'PickList',
      'ProgressBar',
      'Rating',
      'RadioButton',
      'SelectButton',
      'ScrollPanel',
      'ScrollTop',
      'Slider',
      'Sidebar',
      'Skeleton',
      'SplitButton',
      'Splitter',
      'SplitterPanel',
      'Steps',
      'TabMenu',
      'Tag',
      'TieredMenu',
      'Textarea',
      'Timeline',
      'Toast',
      'Toolbar',
      'TabView',
      'TabPanel',
      'ToggleButton',
      'Tree',
      'TreeTable',
      'TriStateCheckbox',
      'Editor',
      'SpeedDial'
    ],
    directives: ['Tooltip', 'Ripple', 'BadgeDirective', 'StyleClass'],
  },

  modules: ['primevue/nuxt'],

  loading: {
    color: '#BA68C8',
  },

  router: {
    middleware: ['auth'],
  },

  build: {
    extend(config, { isDev, isClient }) {
      if (!isDev && isClient && config.plugins) {
        config.plugins.push(
          new WebpackObfuscator({
            rotateStringArray: true
          }, ['node_modules/**/*.js', '../../node_modules/**/*.js'])
        );
      }
    }
  }
})
