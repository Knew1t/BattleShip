package handlers

import (
	"github.com/labstack/echo/v4"
	"html/template"
	"io"
	"net/http"
	"time"
)

type TemplateRenderer struct {
	templates *template.Template
}

// Render выполняет рендеринг шаблона
func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func renderBase(c echo.Context, page string, data map[string]interface{}) error {
	renderer := &TemplateRenderer{
		templates: template.Must(template.ParseFiles("static/html/base.layout.tmpl",
			"static/html/header.partial.tmpl",
			"static/html/menu.partial.tmpl",
			"static/html/"+page)),
	}

	// Рендерим шаблон и отправляем результат клиенту
	err := renderer.Render(c.Response().Writer, page, data)

	if err != nil {
		return err
	}

	return err
}

func LogoutHandler(c echo.Context) error {
	cookie := &http.Cookie{
		Name:    "token",
		Value:   "",
		Expires: time.Now().Add(-1 * time.Hour),
	}
	c.SetCookie(cookie)
	return c.Redirect(http.StatusFound, "/")
}

//AddShipKill
