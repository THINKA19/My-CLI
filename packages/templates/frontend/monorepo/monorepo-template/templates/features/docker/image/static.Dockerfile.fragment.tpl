FROM base AS build
RUN __BUILD_COMMAND__

FROM nginx:alpine AS prod
COPY --from=build __COPY_OUTPUT__
COPY __COPY_NGINX__
EXPOSE 80
