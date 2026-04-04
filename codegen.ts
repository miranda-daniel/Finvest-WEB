import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:3001/graphql',
  documents: ['src/**/*.tsx', 'src/**/*.ts', 'src/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    './src/api/generated/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
}

export default config
