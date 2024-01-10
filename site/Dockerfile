FROM golang:1.19

WORKDIR /app

COPY src/ .
RUN go mod download

RUN go build -o main .
RUN ls -l
RUN pwd
CMD ["/app/main"]
#CMD "go run ."
