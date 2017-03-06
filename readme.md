
Config mongo admin
```
$ docker exec -it some-mongo mongo admin

db.createUser({ user: 'admin', pwd: 'xxx',
roles: [ { role: "root", db: "admin" } ] });

use prestasoc
db.createUser({ user: 'prestasoc', pwd: 'prestasoc',
roles: [ { role: "readWrite", db: "prestasoc" } ] });


```