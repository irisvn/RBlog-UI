# syntax=docker/dockerfile:1.10
# RBlog UI: Next.js standalone server.
#
# RBLOG_URL (the CMS, for the image optimizer's allowed host) and SITE_URL are needed at build time.
# A Content API key is optional: without one the build needs no access to RBlog and prerenders
# empty pages that the first request after the deploy refreshes (src/lib/rblog.ts, OFFLINE). With
# one, given as a BuildKit secret (never stored in a layer), pages are prerendered with content:
#   docker build --build-arg RBLOG_URL=https://cms.example.com --build-arg SITE_URL=https://blog.example.com \
#     [--secret id=rblog_content_key,env=RBLOG_CONTENT_KEY] -t rblog-ui .
# At run time, give RBLOG_CONTENT_KEY and RBLOG_WEBHOOK_SECRET as environment variables.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ARG RBLOG_URL
ARG SITE_URL
ENV RBLOG_URL=$RBLOG_URL \
    SITE_URL=$SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=rblog_content_key,env=RBLOG_CONTENT_KEY \
    test -n "$RBLOG_URL" && test -n "$SITE_URL" && npm run build

FROM node:22-alpine AS run
WORKDIR /app
ARG RBLOG_URL
ARG SITE_URL
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    RBLOG_URL=$RBLOG_URL \
    SITE_URL=$SITE_URL
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/robots.txt || exit 1
CMD ["node", "server.js"]
