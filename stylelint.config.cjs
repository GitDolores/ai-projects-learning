/** @format */

// 1. 将文件重命名为 stylelint.config.cjs 彻底解决 ERR_REQUIRE_CYCLE_MODULE 报错
// 2. 移除已废弃的 stylelint-config-prettier
module.exports = {
  root: true,
  extends: [
    'stylelint-config-standard-scss', // 官方推荐的 SCSS 标准扩展
    'stylelint-config-recommended-vue/scss', // 适配 Vue SFC 中的 scss
    'stylelint-config-recess-order', // 属性排序
  ],
  rules: {
    // 基础规则调整
    'no-empty-source': null,
    'no-descending-specificity': null,
    
    // 兼容性调整：允许 Vue 的 :deep, :global 等伪类
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global', 'slotted'],
      },
    ],
    
    // 兼容性调整：允许 CSS 变量和 Vue v-bind
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['v-bind'],
      },
    ],

    // SCSS 相关规则优化
    'scss/at-import-partial-extension': null,
    'scss/at-import-no-partial-leading-underscore': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen'],
      },
    ],
    
    // 解决一些常见的警告
    'value-keyword-case': null, // 解决 v-bind 驼峰命名报错
    'selector-class-pattern': null, // 允许类名不强制使用中划线（可选）
  },
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx',
    'dist/**',
    'public/**',
    'index.html',
    'node_modules/**',
  ],
};