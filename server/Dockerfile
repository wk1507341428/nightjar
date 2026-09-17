# syntax=docker/dockerfile:1

FROM golang:1.23-alpine AS builder
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/sidejob-api .

FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Shanghai
WORKDIR /app

COPY --from=builder /out/sidejob-api /app/sidejob-api
COPY etc/sidejob-api.yaml /app/etc/sidejob-api.yaml

EXPOSE 9800
ENTRYPOINT ["/app/sidejob-api", "-f", "/app/etc/sidejob-api.yaml"]

