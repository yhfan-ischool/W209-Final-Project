# W209-Final-Project

## Start and stop PostgreSQL server

```
pg_ctl -D /usr/local/var/postgres_9.6 start
pg_ctl -D /usr/local/var/postgres_9.6 stop
```

## Start the API server

```
python data_server.py
```

## Start the HTTP server

```
python -m SimpleHTTPServer 8888

```
