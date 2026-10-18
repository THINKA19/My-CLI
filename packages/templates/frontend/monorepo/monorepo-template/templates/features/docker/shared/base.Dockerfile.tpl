FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
