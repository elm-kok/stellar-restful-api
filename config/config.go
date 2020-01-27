package config

type Config struct {
	DB *DBConfig
}

type DBConfig struct {
	Dialect  string
	Host     string
	Port     int
	Username string
	Password string
	Name     string
	Charset  string
}

func GetConfig() *Config {
	return &Config{
		DB: &DBConfig{
			Dialect:  "postgres",
			Host:     "localhost",
			Port:     5432,
			Username: "kok",
			Password: "123456",
			Name:     "stellar",
			Charset:  "utf8",
		},
	}
}
