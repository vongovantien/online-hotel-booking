# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Custom default nginx conf can go here if needed, default is sufficient for SPAs without deep routing path fallbacks
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
