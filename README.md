# NodeJS GraphQL Microservices

This is boilerplate template for GraphQL microservices implemented using **[Apollo Federation](https://www.apollographql.com/docs/federation/)**.

## Architecture Overview

### Apollo Federation

An Apollo Federation architecture consists of:

- A collection of **subgraphs** (usually represented by different back-end services) that each define a distinct GraphQL schema

- A **gateway** that composes the subgraphs into a **federated data graph** and executes queries across multiple subgraphs

### Managed federation

Apollo provides free **[managed federation](https://www.apollographql.com/docs/federation/managed-federation/overview/)** support for data graphs that use Apollo Federation.

With managed federation, your [gateway](https://www.apollographql.com/docs/federation/gateway/) is no longer responsible for fetching schemas from your [subgraphs](https://www.apollographql.com/docs/federation/subgraphs/) on startup. Instead, your subgraphs push their schemas to the Apollo schema registry, which verifies that they successfully **compose** into a federated schema.

On composition success, Studio updates a dedicated configuration file that's stored in Google Cloud Services, which your gateway regularly polls for updates.

<p  align="center">

<img  src="https://user-images.githubusercontent.com/22884683/116814161-02b6f480-ab75-11eb-95bc-2374021a6780.png"  alt="managed-federation-architecture">

</p>

## How to Run

### Pre-requisites

1. Docker - [Installation](https://docs.docker.com/engine/install/)

2. Docker Compose - [Installation](https://docs.docker.com/compose/install/)

3. Graph API key from Apollo (used for registering the schema and polling config changes)
   - Create a Apollo Studio account by following [this](https://www.apollographql.com/docs/studio/getting-started/) guide.
   - Click on 'New Graph' button, and enter the graph name. A dialog would appear to register your schema which would have the `APOLLO_KEY`, save it locally.

### Running development setup

1. Configure environment variables by navigating into each of the folders in the project root, and create a `.env` file from `.env.example`. Replace the environment secrets with your own.

```bash

> cp .env.example .env

```

2. Navigate to the `docker` folder in project root and run the following command to start the services.

```bash

> docker-compose up

```

3. Final Step is to register the federated schema for all the services. Follow the instructions in below [Push Schema Updates to Registry](#push-schema-updates-to-registry) section and register the schema for **gateway**, **auth** and **blog** services.

**Note:** Once all the services have started, the GraphQL Playground for gateway would be running on [http://localhost:5000/graphql](http://localhost:5000/graphql)

Check [this](#issues-you-may-face) if you face any issue.

## Push Schema Updates to Registry

1. Make sure the service for which your pushing schema updates is running via `docker-compose`.

2. Open interactive shell prompt inside your running service.

```bash

> docker exec -it container_name sh

```

> container_name = gateway (or) auth (or) blog

3. Run the following npm command to push your changes to the schema registry.

```bash

> variant=development npm run service:push

```

> Note: Each graph has one or more **variants**, which correspond to the different environments where the graph runs (such as development and production).

---

### Issues you may face

- If you're setting up a new graph and start all the services through `docker-compose`, the gateway service would fail with an error, stating to ensure you have a federated service pushed to the graph. To fix it, register the schema for auth and blog services and then restart you gateway service (`docker restart gateway`). Now the gateway should successfully poll the federated schema.

- If you try to register blog service before registering auth service, `service:push` would fail with an error, `Command failed`. This is because blog schema has few objects that depend on objects in auth schema (via `@extends` directive). Schema registry won't be able to compose services into a single federated schema because of the missing types. To fix it, you can just push the auth service right after it and the graph would be federated, or better is to follow topological ordering when registering/pushing schema updates.
