import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import configPrettier from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
    globalIgnores(['**/.*', 'dist/*', '*.d.ts', 'public/*', 'src/assets/**', 'src/**/iconfont/**']),
    {
        ...js.configs.recommended,
        ...eslintPluginPrettierRecommended,
        languageOptions: {
            globals: {
                // types/index.d.ts
                RefType: 'readonly',
                EmitType: 'readonly',
                TargetContext: 'readonly',
                ComponentRef: 'readonly',
                ElRef: 'readonly',
                ForDataType: 'readonly',
                AnyFunction: 'readonly',
                PropType: 'readonly',
                Writable: 'readonly',
                Nullable: 'readonly',
                NonNullable: 'readonly',
                Recordable: 'readonly',
                ReadonlyRecordable: 'readonly',
                Indexable: 'readonly',
                DeepPartial: 'readonly',
                Without: 'readonly',
                Exclusive: 'readonly',
                TimeoutHandle: 'readonly',
                IntervalHandle: 'readonly',
                Effect: 'readonly',
                ChangeEvent: 'readonly',
                WheelEvent: 'readonly',
                ImportMetaEnv: 'readonly',
                Fn: 'readonly',
                PromiseFn: 'readonly',
                ComponentElRef: 'readonly',
                parseInt: 'readonly',
                parseFloat: 'readonly',
            },
        },
        plugins: {
            prettier: pluginPrettier,
        },
        rules: {
            ...configPrettier.rules,
            //...pluginPrettier.configs.recommended.rules,
            'no-debugger': 'off',
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            'prettier/prettier': [
                'error',
                {
                    printWidth: 500,
                    tabWidth: 4,
                    singleQuote: true,
                    semi: false,
                    bracketSameLine: false,
                    singleAttributePerLine: false,
                    htmlWhitespaceSensitivity: 'css',
                },
            ],
            indent: [
                'error',
                4,
                {
                    // 核心：开启三目运算换行缩进
                    flatTernaryExpressions: true, // 关闭扁平化三目运算（强制换行）
                    offsetTernaryExpressions: true, // 三目运算换行后缩进 4 空格
                    // 其他缩进兜底配置（保持）
                    SwitchCase: 1,
                    VariableDeclarator: 1,
                    outerIIFEBody: 1,
                    ignoredNodes: ['TemplateLiteral *', 'JSXElement > *'],
                },
            ],
        },
    },
    ...tseslint.configs.recommended.map((config) => ({
        ...config,
        files: ['**/*.?([cm])ts', '**/*.?([cm])tsx'],
    })),
    {
        files: ['**/*.?([cm])ts', '**/*.?([cm])tsx'],
        rules: {
            '@typescript-eslint/no-redeclare': 'error',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/prefer-as-const': 'warn',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    disallowTypeAnnotations: false,
                    fixStyle: 'inline-type-imports',
                },
            ],
            '@typescript-eslint/prefer-literal-enum-member': ['error', { allowBitwiseExpressions: true }],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            indent: 'off',
        },
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            'eslint-comments/no-unlimited-disable': 'off',
            'import/no-duplicates': 'off',
            'no-restricted-syntax': 'off',
            'unused-imports/no-unused-vars': 'off',
            indent: 'off',
        },
    },
    {
        files: ['**/*.?([cm])js'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            indent: 'off',
        },
    },
    {
        files: ['**/*.vue'],
        languageOptions: {
            globals: {
                $: 'readonly',
                $$: 'readonly',
                $computed: 'readonly',
                $customRef: 'readonly',
                $ref: 'readonly',
                $shallowRef: 'readonly',
                $toRef: 'readonly',
            },
            parser: parserVue,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                extraFileExtensions: ['.vue'],
                parser: tseslint.parser,
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            vue: pluginVue,
        },
        processor: pluginVue.processors['.vue'],
        rules: {
            ...pluginVue.configs.base.rules,
            ...pluginVue.configs.essential.rules,
            ...pluginVue.configs.recommended.rules,
            'no-undef': 'off',
            'no-unused-vars': 'off',
            'vue/no-v-html': 'off',
            'vue/require-default-prop': 'off',
            'vue/require-explicit-emits': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/no-setup-props-reactivity-loss': 'off',
            'operator-linebreak': 'off',
            'vue/operator': 'off',
            'vue/html-self-closing': [
                'error',
                {
                    html: {
                        void: 'always',
                        normal: 'always',
                        component: 'always',
                    },
                    svg: 'always',
                    math: 'always',
                },
            ],
            indent: 'off', // 关闭普通 indent 规则，用 vue/script-indent 替代
            // ====== 关闭 Vue 模板标签属性格式限制 ======
            'vue/max-attributes-per-line': 'off',
            'vue/first-attribute-linebreak': 'off',
            'vue/html-closing-bracket-newline': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/multiline-html-element-content-newline': 'off',
            'vue/html-indent': 'off',
            'vue/attribute-hyphenation': 'off',
        },
    },
])
