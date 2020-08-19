# Wave Payroll Challenge - Nodejs

API server in Nodejs for the Wave Payroll Challenge (link)[https://github.com/wvchallenges/se-challenge-payroll].

## Build

Since Node14 supports the latest Javascript features, Babel is not required, thus no special build steps are required to run the application.

### Dev Version (Docker) - Includes Tests and Database Migrations

1. `docker build . -t makerzenen/se-challenge-payroll-dev:latest --target=dev`

### Production Version (Docker) - Only What's Needed for Production

1. `docker build . -t makerzenen/se-challenge-payroll-release:latest --target=release`

## Run Server Locally

1. `yarn start`

## Test Locally

1. `yarn db:reset`
2. `yarn test`

## Run Tests Locally with docker-compose

`docker-compose up -d se-challenge-payroll-dev se-challenge-payroll-release database && \
    docker-compose exec se-challenge-payroll-dev yarn db:reset && \
    docker-compose exec se-challenge-payroll-dev yarn test && \
    docker-compose exec se-challenge-payroll-dev ping se-challenge-payroll-release`
