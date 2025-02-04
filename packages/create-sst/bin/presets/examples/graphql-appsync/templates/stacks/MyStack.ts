import { StackContext, Table, AppSyncApi } from "@serverless-stack/resources";

export function MyStack({ stack }: StackContext) {
  // Create a notes table
  const notesTable = new Table(stack, "Notes", {
    fields: {
      id: "string",
    },
    primaryIndex: { partitionKey: "id" },
  });

  // Create the AppSync GraphQL API
  const api = new AppSyncApi(stack, "AppSyncApi", {
    schema: "api/graphql/schema.graphql",
    defaults: {
      function: {
        // Pass the table name to the function
        environment: {
          NOTES_TABLE: notesTable.tableName,
        },
      },
    },
    dataSources: {
      notes: "functions/main.handler",
    },
    resolvers: {
      "Query    listNotes": "notes",
      "Query    getNoteById": "notes",
      "Mutation createNote": "notes",
      "Mutation updateNote": "notes",
      "Mutation deleteNote": "notes",
    },
  });

  // Enable the AppSync API to access the DynamoDB table
  api.attachPermissions([notesTable]);

  // Show the AppSync API Id in the output
  this.addOutputs({
    ApiId: api.apiId,
    ApiKey: api.cdk.graphqlApi.apiKey,
    APiUrl: api.url,
  });
}
