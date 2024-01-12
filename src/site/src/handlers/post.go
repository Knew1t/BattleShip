package handlers

import (
	"SeaBattle/auth"
	db "SeaBattle/database"
	"fmt"
	"github.com/labstack/echo/v4"
	"net/http"
	"time"
)

func AddShipKill(c echo.Context) error {
	var username = ""
	cookie, err := c.Cookie("token")
	if err == nil {
		username, err = auth.VerifyAndExtractUsername(cookie.Value)
	}
	fmt.Println("Username = " + username)
	if username == "" {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "Unauthorized",
			"code":  401,
		})
	}
	//shipType := c.FormValue("ship_type")
	var jsonData map[string]interface{}

	// Извлечение данных JSON из тела запроса
	if err := c.Bind(&jsonData); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	shipType, ok := jsonData["ship_type"].(string)
	if !ok {
		fmt.Println("Не удалось преобразовать в строку")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})

	}
	err = db.Get().AddShipKill(username, shipType)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"result":  "error",
			"message": err.Error(),
		})
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{
		"result": "success",
	})
}

func AddMatch(c echo.Context) error {
	var username = ""
	cookie, err := c.Cookie("token")
	if err == nil {
		username, err = auth.VerifyAndExtractUsername(cookie.Value)
	}
	fmt.Println("Username = " + username)
	if username == "" {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "Unauthorized",
		})
	}
	res := c.FormValue("result")
	result := true
	if res == "0" {
		result = false
	}
	err = db.Get().AddMatch(username, result)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"result":  "error",
			"message": err.Error(),
		})
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{
		"result": "success",
	})
}

// TakeAuthHandler Обработчик для авторизации
func TakeAuthHandler(c echo.Context) error {

	username := c.FormValue("username")
	pass := c.FormValue("password")

	client, err := db.Get().SelectClientByLogin(username)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"status":       "error",
			"error_reason": "database error",
			"error":        err.Error(),
		})
	}
	if client == nil {
		return c.JSON(http.StatusForbidden, map[string]interface{}{
			"status":       "error",
			"error-reason": "invalid login",
		})
	} else if !auth.ComparePassword(client.Password, pass) {
		return c.JSON(http.StatusForbidden, map[string]interface{}{
			"status":       "error",
			"error-reason": "invalid password",
		})
	}
	// Создаем JWT токен
	tokenString, err := auth.CreateToken(username)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"status":       "error",
			"error-reason": "error when creating token",
		})
	}
	// Устанавливаем куки с токеном в браузер
	cookie := new(http.Cookie)
	cookie.Name = "token"
	cookie.Value = tokenString
	cookie.Expires = time.Now().Add(24 * 7 * time.Hour)
	c.SetCookie(cookie)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
	})
}

type RegistrationData struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

// TakeRegHandler регистрация пользователя
func TakeRegHandler(c echo.Context) error {
	var data RegistrationData

	// Прочитать и декодировать JSON из тела запроса
	if err := c.Bind(&data); err != nil {
		return c.String(http.StatusBadRequest, "Invalid JSON data")
	}
	fmt.Println(data)

	login := data.Login
	pass := data.Password
	fmt.Println(login)
	fmt.Println(pass)
	pass, err := auth.HashPassword(pass)
	if err != nil {
		return c.String(http.StatusServiceUnavailable, err.Error())
	}

	err = db.Get().AddClient(login, pass)
	if err != nil {
		if err.Error() == "ERROR: duplicate key value violates unique constraint \"clients_pkey\" (SQLSTATE 23505)" {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"result": "error",
				"reason": "username is already used",
			})
		}
		return c.String(http.StatusServiceUnavailable, err.Error())
	}

	// Создаем JWT токен
	tokenString, err := auth.CreateToken(login)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Failed to create token")
	}

	// Устанавливаем куки с токеном в браузер
	cookie := new(http.Cookie)
	cookie.Name = "token"
	cookie.Value = tokenString
	cookie.Expires = time.Now().Add(24 * 1 * time.Hour)
	c.SetCookie(cookie)

	return c.JSON(201, map[string]interface{}{
		"status": "success",
	})
}
