// eslint.config.js (your flat config example)
import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks'; // <-- 1) IMPORT

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
        languageOptions: {
            parser: tsParser,
            globals: { ...globals.browser, ...globals.node, JSX: true },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        // 2) Add "react-hooks" to the plugins object:
        plugins: {
            '@typescript-eslint': tsEslint,
            react: pluginReact,
            'react-hooks': pluginReactHooks,
        },
        // 3) Merge in recommended rules from each plugin
        rules: {
            ...pluginJs.configs.recommended.rules,
            ...tsEslint.configs.recommended.rules,
            ...pluginReact.configs.flat.recommended.rules,
            ...pluginReactHooks.configs.recommended.rules, // add recommended react-hooks

            // Then any custom rules:
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-require-imports': 'off',
            'react/prop-types': 'off',
            // If you explicitly want to tweak the react-hooks/exhaustive-deps rule:
            // 'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        ignores: [
            'node_modules/',
            'dist/',
            'build/',
            'out/',
            '.next/',
            'coverage/',
            'public/',
        ],
    },
    {
        files: ['tailwind.config.ts'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
];
