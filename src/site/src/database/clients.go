package database

import "time"

type Client struct {
	Login      string           `gorm:"type:varchar;primaryKey;unique"`
	Password   string           `gorm:"type:varchar;not null"`
	CreateDate time.Time        `gorm:"default:CURRENT_TIMESTAMP"`
	Ships      []ShipsDestroyed `gorm:"foreignKey:Login"`
	Matches    []Matches        `gorm:"foreignKey:match_login"`
}

func (dbe *DbEngine) SelectClientByLogin(login string) (*Client, error) {
	var client Client
	if err := dbe.db.Where("login = ?", login).First(&client).Error; err != nil {
		return nil, err
	}
	return &client, nil
}

func (dbe *DbEngine) AddClient(login string, password string) error {
	newClient := &Client{
		Login:      login,
		Password:   password,
		CreateDate: time.Now(),
	}

	return dbe.db.Create(newClient).Error
}
