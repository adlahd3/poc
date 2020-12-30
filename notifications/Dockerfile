FROM node:12.18-alpine
ENV NODE_ENV=staging
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
CMD ["node", "notify_owner.js"]
