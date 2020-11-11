# node-js-getting-started
Backend using Node and express


POST /v1/creategame
Här skickar vi med rumskod och en genererad spelkod som jsonbody. Datan sparas i tabellen "gametable"
statuskod:
200 SUCCESS
403 Room code already exists

OBS! rumskoden får inte innehålla mellanslag !!!!!!!!!!!!!!!!!!!!!!!

{
	"room": "annikasspel1",
	"gamecode" : "12, 13, 5, 8"
}



GET /v1/room/annikasspel1 <----rumskod
Här hämtar eleven den genererade spelkoden som tillhör rummet från "gametable"
Skickas tillbaka som ett jsonobjekt:

{
  "gamecode": "12, 13, 5, 8"
}




POST /v1/createplayer
Här skickas playerns nickname tillsammans med rumskod
som json i requestbody till tabellen "playertable"
statuskod:
201 User with *nickname* created

OBS! nickname kan innehålla mellanslag

{
	"room": "klass3b",
	"nickname" : "luis"
}



PUT /v1/playerresult
Här skickar playern sina resultat som json i requestbody. Datan sparas i tabellen "playertable"
statuskod:
200

{
	"room": "klass3b",
	"nickname" : "luis",
	"correctanswers" : 5,
	"totaltime" : 2.40
}



GET /v1/winner
Skickar allas resultat tillsammans med sina nicknames
Rumskoden skickas med som jsonobjekt i requestbody

Om correctanswers och totaltime = -1 betyder det att spelaren inte skickat in sina resultat ännu.

En array skickas tillbaka:

{
  "results": [
    {
      "nickname": "Luis",
      "correctanswers": "666",
      "totaltime": "666",
      "room": "RaufGodlike"
    },
    {
      "nickname": "Luis",
      "correctanswers": "-1",
      "totaltime": "-1",
      "room": "RaufGodlike"
    },
    {
      "nickname": "LuisTVA",
      "correctanswers": "-1",
      "totaltime": "-1",
      "room": "RaufGodlike"
    }
  ]
}

GET/v1/ping
Använd ping för att starta igång servern vid "index"/första sidan,
detta gör att spelaren inte måste invänta uppstart av databas.

Databas:

table:
gametable
rows:
room (text)
gamecode (text)

table:
playertable
rows:
nickname (text)
correctanswers (integer)
totaltime (decimal)
room (text)

table:
ping
rows:
id(int)
counter(int)
