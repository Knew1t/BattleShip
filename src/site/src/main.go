package main

import (
	"SeaBattle/auth"
	"SeaBattle/database"
	"SeaBattle/handlers"
	"fmt"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"log"
	"os"
)

func main() {
	e := echo.New()
	if os.Getenv("DC") != "y" {
		if err := godotenv.Load(); err != nil {
			log.Fatal("Error loading .env file")
		}
	}

	dsn := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=%s TimeZone=%s",
		os.Getenv("DBUSERNAME"),
		os.Getenv("DBPASSWORD"),
		os.Getenv("DBNAME"),
		os.Getenv("DBHOST"),
		os.Getenv("DBPORT"),
		os.Getenv("DBSSLMODE"),
		os.Getenv("TIMEZONE"))
	database.Get().ConnectToDB(dsn)
	database.Get().CreateClientsTable()

	auth.SetJwtKey(os.Getenv("JWTKEY"))

	// Middleware
	e.Use(middleware.Logger())
	//e.Use(middleware.Recover())
	e.Use(middleware.Secure())

	e.Static("/", "static")

	e.GET("/signIn", handlers.SignInHandler)
	e.GET("/signUp", handlers.SignUpHandler)
	e.GET("/bestPlayers", handlers.LeaderboardsHandler)
	e.GET("/myStats", handlers.StatsHandler)

	e.POST("/login", handlers.TakeAuthHandler)
	e.POST("/reg", handlers.TakeRegHandler)
	e.GET("/logout", handlers.LogoutHandler)

	e.POST("/ship_kill", handlers.AddShipKill)
	e.POST("/add_match", handlers.AddMatch)

	e.GET("/", handlers.MainHandler)
	e.Logger.Fatal(e.Start(":8080"))
	//e.Logger.Fatal(e.StartTLS(os.Getenv("STANDARTPORT"), os.Getenv("SERTFILE"), os.Getenv("KEYFILE")))
}
