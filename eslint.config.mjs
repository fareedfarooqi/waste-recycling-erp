import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginReact from 'eslint-plugin-react';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
        languageOptions: {
            parser: tsParser, // Use @typescript-eslint/parser
            globals: { ...globals.browser, ...globals.node, JSX: true }, // Add JSX as a global
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        plugins: {
            '@typescript-eslint': tsEslint, // Use @typescript-eslint plugin
            react: pluginReact,
        },
        rules: {
            ...pluginJs.configs.recommended.rules,
            ...tsEslint.configs.recommended.rules,
            ...pluginReact.configs.flat.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-require-imports': 'off',
            'react/prop-types': 'off',
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
            '@typescript-eslint/no-require-imports': 'off', // Disable for Tailwind config
        },
    },
];
