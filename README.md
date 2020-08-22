# Wave Payroll Challenge - Nodejs

API server in Nodejs for the Wave Payroll Challenge ([link](https://github.com/wvchallenges/se-challenge-payroll)).

## Endpoints

1. GET / - homepage
2. GET /ping - for pinging (healthchecks)
3. GET /payroll-report - returns the payroll report containing payment information for all employees, all time
4. POST /time-report-upload - upload a time report file using form data for processing

## Build

Since Node14 supports the latest Javascript features, Babel is not required, thus no special build steps are required to build the application.

### Local Install

`yarn install`

### Dev Version (Docker) - Includes Tests and Database Migrations

`docker build . -t makerzenen/se-challenge-payroll-dev:latest --target=dev`

### Production Version (Docker) - Only What's Needed for Production

`docker build . -t makerzenen/se-challenge-payroll-release:latest --target=release`

## Run Server Locally

`yarn start:dev`

## Test Locally (Assumes Local Postgres Install)

1. `yarn db:reset`
2. `yarn test`

## Test File Upload Using Test File

1. `yarn db:reset`
2. `yarn start:dev`
3. `curl --location --request POST 'localhost:8080/time-report-upload' --form 'file=@./test/data/time-report-42.csv'`

## Run Tests Locally with docker-compose

```bash
docker-compose up -d se-challenge-payroll-dev se-challenge-payroll-release database && \
    docker-compose exec se-challenge-payroll-dev yarn db:reset && \
    docker-compose exec se-challenge-payroll-dev yarn test && \
    docker-compose exec se-challenge-payroll-dev ping se-challenge-payroll-release
```

## Changes for Production

Given that this is a test project, I would make the following improvements for a production release:

1. Add CircleCI deployment pipeline.
2. Better test coverage that looks at failure cases in more detail.
3. Use models to simplify database interactions.
4. Refactor `routes.js` to isolate some of the parsing logic for testability.
5. Use Flow or Typescript for safety.
6. Add some form of endpoint authentication.
