package handlers

import (
	"SeaBattle/auth"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
	"html/template"
	"io"
	"net/http"
	"time"

	db "SeaBattle/database"
)

type TemplateRenderer struct {
	templates *template.Template
}

// Render выполняет рендеринг шаблона
func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

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
	data := map[string]interface{}{}

	err = renderBase(c, "game_menu.html", data)
	if err != nil {
		log.Error(err.Error())
	}
	return err
}

func SignInHandler(c echo.Context) error {
	var username = ""
	cookie, err := c.Cookie("token")
	if err == nil {
		username, err = auth.VerifyAndExtractUsername(cookie.Value)
	}
	if username != "" {
		return c.Redirect(http.StatusFound, "/")
	}

	// Данные для передачи в шаблон
	data := map[string]interface{}{}
	err = renderBase(c, "signin.html", data)
	if err != nil {
		log.Error(err.Error())
	}
	return err
}

func SignUpHandler(c echo.Context) error {
	var username = ""
	cookie, err := c.Cookie("token")
	if err == nil {
		username, err = auth.VerifyAndExtractUsername(cookie.Value)
	}
	if username != "" {
		return c.Redirect(http.StatusFound, "/")
	}

	// Данные для передачи в шаблон
	data := map[string]interface{}{}
	err = renderBase(c, "signup.html", data)
	if err != nil {
		log.Error(err.Error())
	}
	return err
}

func renderBase(c echo.Context, page string, data map[string]interface{}) error {
	renderer := &TemplateRenderer{
		templates: template.Must(template.ParseFiles(
			"static/pages/" + page)),
	}

	// Рендерим шаблон и отправляем результат клиенту
	err := renderer.Render(c.Response().Writer, page, data)
	if err != nil {
		return err
	}
	return err
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

// TakeRegHandler регистрация пользователя
func TakeRegHandler(c echo.Context) error {
	login := c.FormValue("login")
	pass := c.FormValue("password")

	pass, err := auth.HashPassword(pass)
	if err != nil {
		return c.String(http.StatusServiceUnavailable, err.Error())
	}

	err = db.Get().AddClient(login, pass)
	if err != nil {
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

	return c.Redirect(http.StatusSeeOther, "/")
}
