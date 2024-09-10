# Node.js Backend Architecture Typescript Project

# Project Highlights

1. Node.js
2. Express.js
3. Typescript
4. Postgresql
5. Swagger
6. Docker
7. JWT

# About The Project

This project is designed for a production-ready environment. In the project, we are using Postgresql as a database.

# Project Instructions

The following are the features of this project:

* **This backend is written in Typescript**: The type safety at build time and having intellisense for it in the IDE like vscode is unparalleled to productivity. I have found that the production bug was reduced significantly since most of the code vulnerabilities were identified during the build phase.
* **Separation of concern principle**: Each component has been given a particular role. The role of the components is mutually exclusive. This makes the project easy to be unit test.
* **Feature encapsulation**: The files or components that are related to a particular feature have been grouped unless those components are required in multiple features. This enhances the ability to share code across projects.
* **Centralised Error Handling**: I have created a framework where all the errors are handled centrally. This reduces the ambiguity in the development when the project grows larger.
* **Centralised Response handling**: Similar to Error handling we have a response handling framework. This makes it very convenient to apply a common API response pattern.
* **My Sql use throw Postgresql**: According to our requirements, Postgresql was suitable so we used Postgresql.
* **Async execution**: I have used async/await for the promises and made sure to use the non-blocking version of all the functions with few exceptions.
* **Docker compose has been configured**: I have created the Dockerfile to provide easy deployability without any setup and configurations.
* **A pure backend project**: I have experienced that when a backend is developed clubbed with a frontend then in the future it becomes really difficult to scale. We would want to create a separate backend project that servers many websites and mobile apps.

# Getting started

## How to install and run in local

* Clone the repository

```
git clone  <git lab template url> <project_name>
```

- Install dependencies

```
cd <project_name>

yarn install
```

* Make a copy of **.env.example** file to **.env**.

* Build the project

```
yarn build
```

* Run the project

```
yarn start
```

  Navigate to `http://localhost:3000`

* API Document endpoints

  swagger Spec Endpoint: <http://localhost:3000/api-docs>

  swagger-ui  Endpoint: <http://localhost:3000/docs>

## How to build and run this project on Server

* Install using Docker Compose [**Recommended Method**]
  * Clone this repo.
  * Make a copy of **.env.example** file to **.env**.

  * Install Docker and Docker Compose. [Find Instructions Here](https://docs.docker.com/install/).
  * Execute `docker-compose up -d` in the terminal from the repo directory.
  * You will be able to access the API from <http://localhost:3000>
  * *If having any issues* then make sure the 3000 port is not occupied else provide a different port in **.env** file.
  * *If having any issues* then make sure the 27017 port is not occupied else provide a different port in **.env** file.

## Note

* Before committing your code please run the below command.

   ```
   yarn lint:fix
   ```

## Project Directory Structure

 ```
├── .vscode
│   ├── settings.json
│   ├── tasks.json
│   └── launch.json
├── api
│   ├── swagger.json
├── src
│   ├── index.ts
│   ├── config.ts
│   ├── controllers
│   ├── database
│   ├── interceptors
│   ├── observers
│   ├── provider
│   ├── script
│   └── services
│   ├── strategies
│   └── typings
│   ├── utils
├── .env
├── .gitignore
├── .dockerignore
├── .eslintrc
├── .eslintignore
├── Dockerfile
├── docker-compose.yml
├── yarn.lock
├── package.json
├── jest.config.js
└── tsconfig.json
