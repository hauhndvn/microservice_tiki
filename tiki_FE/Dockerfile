FROM node:20

# Tạo thư mục app
WORKDIR /root/tiki_fe

# Copy file phụ thuộc trước để cache
COPY package.json .
RUN yarn install
RUN yarn config set network-timeout 3000000
# Copy toàn bộ mã nguồn
COPY . .

# Thiết lập biến môi trường (tùy chỉnh nếu cần)
# ENV NODE_ENV=production
# ENV PORT=3000

# Build ứng dụng Next.js
RUN yarn run build
# Mở port    
EXPOSE 3000

# Khởi chạy ứng dụng
CMD [ "yarn", "start" ]
