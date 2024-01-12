package database

import (
	"fmt"
)

type Matches struct {
	MatchID     int    `gorm:"type:integer;primaryKey;unique"`
	MatchLogin  string `gorm:"type:varchar;foreignKey:login"`
	MatchResult bool   `gorm:"type:boolean;not null"`
}

type ShipsDestroyed struct {
	Id       int    `gorm:"type:integer;primaryKey;unique"`
	Login    string `gorm:"type:varchar;foreignKey:login"`
	ShipType string `gorm:"type:varchar"`
}

func (dbe *DbEngine) AddMatch(login string, result bool) error {
	newMatch := &Matches{
		MatchLogin:  login,
		MatchResult: result,
	}
	return dbe.db.Create(newMatch).Error
}

func (dbe *DbEngine) GetMatchesByLogin(login string) ([]Matches, error) {
	var matches []Matches
	if err := dbe.db.Where("match_login = ?", login).Find(&matches).Error; err != nil {
		return nil, err
	}
	return matches, nil
}

func (dbe *DbEngine) GetAllStats() ([]map[string]interface{}, error) {
	var stats []map[string]interface{}
	result := dbe.db.Raw(`
		SELECT
			match_login AS login,
			COUNT(*) AS "playedGames",
			SUM(CASE WHEN match_result = TRUE THEN 1 ELSE 0 END) AS total_wins,
    		ROUND((SUM(CASE WHEN match_result = TRUE THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 2) AS "winPercent"
		FROM
			matches
		GROUP BY
			match_login;
	`).Scan(&stats)

	if result.Error != nil {
		fmt.Println(result.Error)
		return nil, result.Error
	}

	return stats, nil
}

func (dbe *DbEngine) GetPlayerStats(login string) (map[string]interface{}, error) {
	var stats map[string]interface{}
	result := dbe.db.Raw(`
SELECT
    COUNT(*) AS "playedGames",
    SUM(CASE WHEN match_result = TRUE THEN 1 ELSE 0 END) AS total_wins,
    ROUND((SUM(CASE WHEN match_result = TRUE THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 2) AS "winPercent"
FROM
    matches
where match_login=?;
	`, login).Scan(&stats)

	if result.Error != nil {
		fmt.Println(result.Error)
		return nil, result.Error
	}
	stats["login"] = login
	return stats, nil
}

func (dbe *DbEngine) GetPlayerShips(login string) (map[string]int, error) {
	var results []struct {
		ShipType string
		Count    int
	}

	err := dbe.db.Model(&ShipsDestroyed{}).
		Select("ship_type, COUNT(*) as count").
		Where("login = ?", login).
		Group("ship_type").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	shipTypeCounts := make(map[string]int)
	for _, result := range results {
		shipTypeCounts[result.ShipType] = result.Count
	}

	return shipTypeCounts, nil
}

func (dbe *DbEngine) AddShipKill(login, shipType string) error {
	newShip := &ShipsDestroyed{
		Login:    login,
		ShipType: shipType,
	}

	return dbe.db.Create(newShip).Error
}
