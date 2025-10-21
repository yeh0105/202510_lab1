# 使用輕量級的 Nginx Alpine 映像
FROM nginx:alpine 

# 新增：嘗試升級/安裝已修補的 pcre2（CVE-2025-58050 修補為 10.46-r0）
# 以兩階段嘗試來兼容不同的 apk repository（若精確版本不存在則退回安裝最新）
RUN apk update && \
    apk add --no-cache pcre2=10.46-r0 || apk add --no-cache pcre2

# 維護者資訊
LABEL org.opencontainers.image.source="https://github.com/YOUR_USERNAME/YOUR_REPO"
LABEL org.opencontainers.image.description="井字遊戲 - 靜態網頁應用"
LABEL org.opencontainers.image.licenses="MIT"

# 移除預設的 Nginx 網頁
RUN rm -rf /usr/share/nginx/html/*

# 複製靜態檔案到 Nginx 目錄
COPY app/ /usr/share/nginx/html/

# 建立自訂的 Nginx 配置（監聽 8080 端口以支援非 root 用戶）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 修改 Nginx 配置以支援非 root 用戶運行
RUN sed -i 's/listen\s*80;/listen 8080;/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's/listen\s*\[::\]:80;/listen [::]:8080;/g' /etc/nginx/conf.d/default.conf && \
    sed -i '/user\s*nginx;/d' /etc/nginx/nginx.conf && \
    sed -i 's,/var/run/nginx.pid,/tmp/nginx.pid,' /etc/nginx/nginx.conf && \
    sed -i "/^http {/a \    proxy_temp_path /tmp/proxy_temp;\n    client_body_temp_path /tmp/client_temp;\n    fastcgi_temp_path /tmp/fastcgi_temp;\n    uwsgi_temp_path /tmp/uwsgi_temp;\n    scgi_temp_path /tmp/scgi_temp;\n" /etc/nginx/nginx.conf

# 新增：建立非 root 使用者 (app)，並調整必要目錄的擁有權與權限
RUN addgroup -S app && adduser -S -G app app && \
    mkdir -p /var/cache/nginx /var/log/nginx /tmp && \
    chown -R app:app /usr/share/nginx/html /var/cache/nginx /var/log/nginx /tmp && \
    chmod -R 0755 /usr/share/nginx/html

# 使用非 root 使用者作為容器預設執行者
USER app

# 暴露 8080 端口（非特權端口）
EXPOSE 8080

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]