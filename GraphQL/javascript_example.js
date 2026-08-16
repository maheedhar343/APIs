/**
 * GraphQL Example (Node.js)
 * ---------------------------
 * Part A: A minimal GraphQL server using Apollo Server (schema matches schema.graphql).
 * Part B: A GraphQL client using `graphql-request`.
 *
 * Install dependencies:
 *   npm install @apollo/server graphql graphql-request
 */

// ---------------------------------------------------------------------------
// PART A: GRAPHQL SERVER (Apollo Server)
// ---------------------------------------------------------------------------
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const typeDefs = `#graphql
  type Repository {
    name: String!
    stargazerCount: Int!
  }

  type User {
    login: String!
    name: String
    bio: String
    repositories(first: Int): [Repository!]!
  }

  type Query {
    user(login: String!): User
  }
`;

// Fake "database"
const USERS_DB = {
  octocat: {
    login: "octocat",
    name: "The Octocat",
    bio: "GitHub mascot",
    repos: [
      { name: "Hello-World", stargazerCount: 2800 },
      { name: "Spoon-Knife", stargazerCount: 12000},
    ],
  },
};

const resolvers = {
  Query: {
    user: (_parent, { login }) => USERS_DB[login] || null,
  },
  User: {
    repositories: (userObj, { first = 5 }) => userObj.repos.slice(0, first),
  },
};

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
  console.log(`GraphQL server ready at ${url}`);
}
// startServer(); // uncomment to run

// ---------------------------------------------------------------------------
// PART B: GRAPHQL CLIENT (graphql-request)
// ---------------------------------------------------------------------------
const { GraphQLClient, gql } = require("graphql-request");

const GRAPHQL_ENDPOINT = "http://localhost:4000/";

async function fetchUserDashboard(login) {
  const client = new GraphQLClient(GRAPHQL_ENDPOINT);

  const query = gql`
    query GetUser($login: String!) {
      user(login: $login) {
        name
        bio
        repositories(first: 5) {
          name
          stargazerCount
        }
      }
    }
  `;

  const data = await client.request(query, { login });
  return data;
}

// Example usage (after starting the server above):
// fetchUserDashboard("octocat").then(console.log);

module.exports = { fetchUserDashboard };
