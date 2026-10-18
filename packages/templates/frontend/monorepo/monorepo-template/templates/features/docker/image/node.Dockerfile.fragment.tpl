FROM base AS build
RUN __BUILD_COMMAND__

# Preserve workspace links and runtime dependencies; prune only with an app-specific deployment strategy.
FROM build AS prod
ENV NODE_ENV=production
USER node
EXPOSE __PORT__
CMD __START_COMMAND__
