package main

import (
"fmt"
"log"
"time"

_ "github.com/lib/pq"
"github.com/jmoiron/sqlx"
)

func main() {
dbURL := "postgres://postgres:password@localhost:5432/atlantic_proxy?sslmode=disable"
fmt.Printf("Attempting to connect to: %s\n", dbURL)

db, err := sqlx.Connect("postgres", dbURL)
if err != nil {
tf("Connection failed: %v\n", err)
 to create the database
tln("\nTrying to connect to postgres database to create atlantic_proxy...")
:= sqlx.Connect("postgres", "postgres://postgres:password@localhost:5432/postgres?sslmode=disable")
!= nil {
tf("Failed to connect to postgres: %v\n", err2)

err3 := db2.Exec("CREATE DATABASE atlantic_proxy;")
!= nil {
tf("Failed to create database: %v\n", err3)

tln("Database created successfully!")

}
defer db.Close()

fmt.Println("✅ Connected successfully!")

// Test ping with timeout
done := make(chan error, 1)
go func() {
e <- db.Ping()
}()

select {
case err := <-done:
!= nil {
tf("Ping failed: %v\n", err)
{
tln("✅ Ping successful!")
* time.Second):
tln("❌ Ping timeout after 5 seconds")
}
}
