import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/dist-dev/**',
            '**/dist-prod/**',
            'coverage/**',
            '.venv/**',
            '.nx/**',
            'pnpm-lock.yaml',
            'package-lock.json',
        ],
    },
    {
        linterOptions: {
            noInlineConfig: true,
            reportUnusedDisableDirectives: 'error',
            reportUnusedInlineConfigs: 'error',
        },
    },
    js.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            globals: globals.node,
        },
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: globals.node,
        },
    },
    ...tseslint.configs.strictTypeChecked.map((config) => ({
        ...config,
        files: ['**/*.ts'],
    })),
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: [
                    'libs/*/tsconfig.test.json',
                    'packages/sdk.stargate-sdk-v1/tsconfig.test.json',
                    'packages/sdk.stargate-cli/tsconfig.json',
                ],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                    'ts-expect-error': 'allow-with-description',
                    'ts-ignore': true,
                    'ts-nocheck': true,
                    'ts-check': false,
                    minimumDescriptionLength: 10,
                },
            ],
            '@typescript-eslint/no-unused-vars': 'off',
            // WebSocket client rejects with [errorType, message] tuples read by mapRejectToError.
            '@typescript-eslint/prefer-promise-reject-errors': 'off',
            // Command identifiers and CLI menu values are string enums compared to wire/inquirer strings.
            '@typescript-eslint/no-unsafe-enum-comparison': 'off',
            // TypeScript lib for this repo does not include ErrorOptions.cause on Error constructor.
            'preserve-caught-error': 'off',
        },
    },
    {
        files: ['**/*.{ts,js}'],
        rules: {
            eqeqeq: ['error', 'always'],
        },
    },
    {
        files: ['**/__tests__/**/*.ts'],
        rules: {
            // Tests stash and restore prototype methods for mocking.
            '@typescript-eslint/unbound-method': 'off',
        },
    },
    {
        files: ['**/SdStargateGetSupportedDataCommand.ts'],
        rules: {
            // Older backends omit newer reply fields; defaults are applied after validation.
            '@typescript-eslint/no-unnecessary-condition': 'off',
        },
    },
    {
        files: ['**/SdBaseValidator.ts'],
        rules: {
            // Shared static validator helpers for jsonschema-backed command DTOs.
            '@typescript-eslint/no-extraneous-class': 'off',
            '@typescript-eslint/no-unnecessary-type-parameters': 'off',
        },
    },
    prettier
);
