"""
GraphQL Example (Python)
--------------------------
Part A: A minimal GraphQL server using Ariadne (schema-first, matches schema.graphql).
Part B: A GraphQL client using `gql` that queries the server.

Install dependencies:
    pip install ariadne uvicorn gql[all] --break-system-packages
"""

# ---------------------------------------------------------------------------
# PART A: GRAPHQL SERVER (Ariadne, schema-first)
# ---------------------------------------------------------------------------
from ariadne import QueryType, make_executable_schema, graphql_sync
from ariadne.wsgi import GraphQL

type_defs = """
    type User {
        login: String!
        name: String
        bio: String
        repositories(first: Int): [Repository!]!
    }

    type Repository {
        name: String!
        stargazerCount: Int!
    }

    type Query {
        user(login: String!): User
    }
"""

# Fake "database"
USERS_DB = {
    "octocat": {
        "login": "octocat",
        "name": "The Octocat",
        "bio": "GitHub mascot",
        "repos": [
            {"name": "Hello-World", "stargazerCount": 2800},
            {"name": "Spoon-Knife", "stargazerCount": 12000},
        ],
    }
}

query = QueryType()


@query.field("user")
def resolve_user(_, info, login):
    """Resolver for the `user` field — fetches from the in-memory DB."""
    return USERS_DB.get(login)


@query.field("repositories")
def resolve_repositories(user_obj, info, first=5):
    """Resolver for nested `repositories` field on User."""
    return user_obj["repos"][:first]


schema = make_executable_schema(type_defs, query)
app = GraphQL(schema, debug=True)  # WSGI app; run with: uvicorn or gunicorn


# ---------------------------------------------------------------------------
# PART B: GRAPHQL CLIENT (gql)
# ---------------------------------------------------------------------------
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

GRAPHQL_ENDPOINT = "http://localhost:8000/graphql"


def fetch_user_dashboard(login: str):
    transport = RequestsHTTPTransport(url=GRAPHQL_ENDPOINT)
    client = Client(transport=transport, fetch_schema_from_transport=False)

    query_str = gql(
        """
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
        """
    )

    result = client.execute(query_str, variable_values={"login": login})
    return result


if __name__ == "__main__":
    # Run server with: uvicorn python_example:app --reload  (port 8000)
    # Then call: print(fetch_user_dashboard("octocat"))
    pass
