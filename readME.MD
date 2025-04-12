1- file database backup: baemin.sql

##

2- file logstash.conf
input {
jdbc {
jdbc*driver_library => "/usr/share/logstash/driver/postgresql-42.2.19.jar"
jdbc_driver_class => "org.postgresql.Driver"
jdbc_connection_string => "jdbc:postgresql://some-postgres:5432/baemin"
jdbc_user => "postgres"
jdbc_password => "1234"
statement => "SELECT * FROM food"
schedule => "\_ \* \* \* \*"
}
}
output {
elasticsearch {
hosts => ["https://elasticsearch:9200"]
ssl => true
ssl_certificate_verification => false
user => "elastic"
password => "123456"
index => "food-index"  
 document_id => "%{food_id}"  
 }
stdout { codec => rubydebug }
}

##

3- gọi các API sau:
GET http://localhost:8080/food/Bánh

## kết quả trả về từ elasticsearch --> OK

GET http://localhost:8080/food?page=1&limit=5&featured=true

## kết quả trả về từ cache --> OK

GET http://localhost:8080/food-name?page=1&limit=5&featured=true&name_food=Bánh

## kết quả trả về từ cache --> OK

POST http://localhost:8080/auth/login
{
"username": "user1",
"password": "password123"
}

## kết quả đã test --> OK

POST http://localhost:8080/auth/sign-up
{
"accountName":"dai1",
"phone":"0912985312",
"address":"2 Ngọc Hà, Ba Đình, Hà Nội",
"email": "hauhndvn@gmail.com",
"password":"1234"
}

## kết quả đã test --> OK

POST http://localhost:8080/order/save-order
{
"customer_id":12,
"statusOrder":1,
"logistics_name":"Now",
"fee": 20000,
"order_items":[
{
"food_id":4 ,
"qty":1 ,
"price":200000,
"discount":0
},
{
"food_id":2 ,
"qty":1 ,
"price":150000,
"discount":0.1
}
]
}

## kết quả đã test --> OK

4- file docker-compose sau khi chạy:
macos@MacOss-MacBook-Pro microservices_baemin % docker-compose up -d
WARN[0000] /Users/macos/Documents/microservices_baemin/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Running 6/6
✔ Container service_product Started 1.5s
✔ Container api_gateway Started 1.5s
✔ Container service_notify Started 1.4s
✔ Container service_order Started 1.5s
✔ Container service_logistics Started 1.1s
✔ Container service_user Started 1.0s

## kết quả đã test lại các API trên --> OK
