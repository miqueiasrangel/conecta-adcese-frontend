# ETAPA 1: Build da aplicação React 18 com Node.js
FROM node:20-alpine AS build
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copia todo o código fonte e gera os arquivos estáticos de produção
COPY . .
RUN npm run build

# ETAPA 2: Servidor Nginx ultra-rápido para servir a aplicação React
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Limpa o diretório padrão do Nginx
RUN rm -rf ./*

# Copia os arquivos gerados no build para o Nginx
COPY --from=build /app/dist .

# Copia a configuração otimizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 do servidor Web
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
