# leaderboard

> A scoring system that displays scores and serves as a leaderboard

## Estimation and Assumption

### Traffic

**Now:**

- The app has approximately 50 million donwloads, lets say 10% of them are DAU so that is 5 million DAU
- Five million DAU means we have **60 RPS** (requests per second) average, at a peak duration we will expect there is 10x the RPS - **600 RPS**

**Future:**

- Assume that we have 30% growth rate, after 3 years we will have 10 million DAU
- Then we will have 115 RPS and 1150 RPS for normal and peak duration respectively

### Storage

A leadboard structure contains the following fields

- Username string, 26 bytes
- Score integer, 2 bytes

Other information of users will be stored in a separate place and should be cached for best performance. We will retrieve them later when we have a list of user IDs from leaderboard. By that way, we can keep the size of the leaderboard as small as possible.

Assume that we need to serve 1000 leaderboards with 1000 records per leaderboard for daily, weekly, monthly and yearly. So that we need storage for 1000 \* 1000 \* 4 = 4000000 records.

So that we need 4000000 \* 28 bytes ~ **112 MB**

### Connections

It's worth to worry about connection because real-time connection requires active connection to maintain clietn-server communication. I assume that one server with **2vCPU** and **8GB RAM** can handle **5000 connections**. So that one server can serve the leaderboard efficiently but if we need high availability we need to spread the load to various server. After that sticky-session is requires as well.

## System Design Documents

### Architecture Diagram

TBD

### Component Descriptions

The Leaderboard system can be design in several ways: hosted in kubernetes, ECS on AWS, on-premise, ... In this project, because of the time limit I will use Docker with docker-compose to deploy the infrastructure. If we have time we can move to kubernetes later.

The system contains three critical components

- The load balancer, which handles request routing for our websocket connection. It MUST support sticky session to maintain consistent connections.
- The websocket instances, developed in NodeJS and Socket.io library for real-time connection.
- The Redis instance, which stores leaderboard data. It MUST support sharding and replica set for high availability. It serves backplane for websocket connection as well.

Other components that are omitted to simplify the design are

- The metadata service that contains user profile: name, avatar, etc. It must cache those information to improve performance.
- A message broker to feed events into the system. We will simulate it with benchmark tools through REST API

## Technology Justification

- Nginx as a reverse proxy and load balancer
- Websocket for real-time connection
- Redis as a database for leaderboard, message broker and backplane of websocket
- NodeJS for backend
- HTML/CSS/JS for frontend
