package handlers

import (
	"SeaBattle/auth"
	db "SeaBattle/database"
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
	"net/http"
	"os"
)

func MainHandler(c echo.Context) error {
	var username = ""
	cookie, err := c.Cookie("token")
	if err == nil {
		username, err = auth.VerifyAndExtractUsername(cookie.Value)
	}
	if username == "" {
		return c.Redirect(http.StatusFound, "/signIn")
	}

	// Данные для передачи в шаблон
	data := map[string]interface{}{
		"title": "Морской бой",
	}

	err = renderBase(c, "game.page.tmpl", data)
	if err != nil {
		log.Error(err.Error())
	}
	return err
}

func LeaderboardsHandler(c echo.Context) error {
	var username = ""
	cookie, err := c.Cookie("token")
	if err == nil {
		username, err = auth.VerifyAndExtractUsername(cookie.Value)
	}
	if username == "" {
		return c.Redirect(http.StatusFound, "/signIn")
	}
	// Данные для передачи в шаблон

	stats, err := db.Get().GetAllStats()
	if err != nil {
		return err
	}
	for elem := range stats {
		fmt.Println(elem, stats[elem])
	}

	data := map[string]interface{}{
		"title": "Таблица лидеров",
		"items": stats,
	}

	err = renderBase(c, "leaderboards.page.tmpl", data)
	if err != nil {
		log.Error(err.Error())
	}
	return err
}

func StatsHandler(c echo.Context) error {
	var username = ""
	cookie, err := c.Cookie("token")
	if err == nil {
		username, err = auth.VerifyAndExtractUsername(cookie.Value)
	}
	if username == "" {
		return c.Redirect(http.StatusFound, "/signIn")
	}
	// Данные для передачи в шаблон

	ships, err := db.Get().GetPlayerShips(username)
	if err != nil {
		return err
	}

	stats, err := db.Get().GetPlayerStats(username)
	if err != nil {
		return err
	}

	var shipsSum int

	// Итерация по значениям карты и их сложение
	for _, value := range ships {
		shipsSum += value
	}

	data := map[string]interface{}{
		"title":    "Статистика",
		"ships":    ships,
		"ShipsSum": shipsSum,
		"stats":    stats,
	}

	err = renderBase(c, "stats.page.tmpl", data)
	if err != nil {
		log.Error(err.Error())
	}
	return err
}

func SignUpHandler(c echo.Context) error {
	//var username = ""
	//cookie, err := c.Cookie("token")
	//if err == nil {
	//	username, err = auth.VerifyAndExtractUsername(cookie.Value)
	//	if username != "" {
	//		return c.Redirect(http.StatusFound, "/")
	//	}
	//}
	fmt.Println("ok SignUpHandler")
	// Данные для передачи в шаблон
	data := map[string]interface{}{}
	err := renderBase(c, "signup.html", data)
	if err != nil {
		log.Error(err.Error())
	}
	return c.HTML(200, "../static/html/signup.html")
}

func SignInHandler(c echo.Context) error {
	var username = ""
	cookie, err := c.Cookie("token")
	if err == nil {
		username, err = auth.VerifyAndExtractUsername(cookie.Value)
	}
	fmt.Println("Username = " + username)
	if username != "" {
		return c.Redirect(http.StatusFound, "/")
	}

	htmlContent, err := os.ReadFile("static/html/signin.html")
	if err != nil {
		return err
	}

	return c.HTML(http.StatusOK, string(htmlContent))
}
