# NodeJs Social Network App

## Description
this repository contains my training process while coding along with learning websockets course academind by [Maximilian Schwarzmüller](https://www.linkedin.com/in/maximilian-schwarzmueller/). 

#### IMPORTANT:
please pay attention to branch history, after every major step of developement I create a branch from it and they are sorted as work progression.

## Usage

### Installing
you should start with `npm install` to create node_modules folder according to defined packages in `package.json` file.

### Used Stacks

  - WebSockets (Socket.io) as request sender for real-time requesting
  - Graphql as query language
  - JsonWebToken as authentication
  - Mongoose as ODM for connecting to Mongodb database

### Folder Structure

```
NodeJs-Social-Network-App/     # Root directory
|- controllers/      # where our route functions exist
|- graphql/      # qraphql related setups
|- middleware/     # is-auth middleware for authentication validation
|- models/     # mongoose schemas

```

### Start

`npm start`: run project in `http://localhost:8080/`.