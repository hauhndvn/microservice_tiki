# ----- Build Stage -----
FROM node:20 AS builder

# Tạo thư mục app
WORKDIR /root/tiki_fe

# Copy file phụ thuộc trước để cache
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

RUN yarn config set network-timeout 3000000

# Copy toàn bộ mã nguồn
COPY . .

# Build ứng dụng Next.js
RUN yarn build

# ----- Production Stage -----
FROM node:20 AS runner

# Thiết lập biến môi trường (tùy chỉnh nếu cần)
# ENV NODE_ENV=production
# ENV PORT=3000

# Tạo thư mục ứng dụng
WORKDIR /root/tiki_fe

# Chỉ copy những gì cần thiết (và đảm bảo nó tồn tại)
COPY --from=builder /root/tiki_fe/.next .next
COPY --from=builder /root/tiki_fe/public ./public
COPY --from=builder /root/tiki_fe/package.json ./package.json
COPY --from=builder /root/tiki_fe/yarn.lock ./yarn.lock
COPY --from=builder /root/tiki_fe/node_modules ./node_modules

# Optional: copy config files nếu có
COPY --from=builder /root/tiki_fe/next.config.mjs ./next.config.mjs
COPY --from=builder /root/tiki_fe/tsconfig.json ./tsconfig.json

# Mở port    
EXPOSE 3000

# Khởi chạy ứng dụng
CMD [ "yarn", "start" ]
