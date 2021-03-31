const dum = require('./dummy');
const urls = require('./URL_METHODS');
const methods = require('./methods');
const express = require('express');
const path = require('path');
const moment_tz = require('moment-timezone');
const moment = require('moment');

let emp = '';

const knx = require('knex')({
  client: 'pg',
  connection: {
    host : 'linxgame.cfaek1ku0lxd.us-east-2.rds.amazonaws.com',
    user : 'Linx_DB',
    password : 'L$Ioasn$#NS12.432.',
    database: 'postgres',
  },
});


class RoomManager
{
  rooms_dictionary = {

     "michael":[
     {
           "username": "syad234a",
           "score": 0
       },
       {
           "username": "syad2",
           "score": 0
       },
       {
           "username": "syad212",
           "score": 0
       },
       {
           "username": "syad212s",
           "score": 0
       },
       {
           "username": "syad212sa",
           "score": 0
       }
   ]
  };

  numberOfRooms = 0;
  roomAutoDeleteTime = 1800000/2;
  string_room = false;

  createRoom = (addSelf = false, username='', room, genesis=false) =>
  {
    if(!this.string_room || genesis == true)
    {
      let {rooms_dictionary, roomNumber,  roomAutoDeleteTime} = this;


      if(room == undefined)
      {

          this.numberOfRooms++;
          roomNumber = this.numberOfRooms;

      }else{
        roomNumber = room
      }


      rooms_dictionary[`${roomNumber}`] = [];

      if(addSelf)
      {
          rooms_dictionary[`${roomNumber}`].push(
            {username: `${username}`, score: 0}
          );
      }

      let room_size = 6;
      if(`${roomNumber}`.includes('team'))
      {
        room_size = 8;
      }

      let incScore = setInterval(methods.Auto_IncreaseScore, 3500, rooms_dictionary[`${roomNumber}`], room_size, knx);

      let addTo = function()
      {
        setTimeout(() => {
          if(rooms_dictionary[`${roomNumber}`].length < room_size)
          {
            methods.Auto_Addtoroom(`${roomNumber}`, room_manager.addUserToRoom, rooms_dictionary);// DEFAULT_ROOM_SIZE);
            addTo();
          }
        }, 5000);
      }

      addTo();


      setTimeout(() => {
      //clearInterval(addTo);
        clearInterval(incScore);
        delete this.rooms_dictionary[`${roomNumber}`];
      }, roomAutoDeleteTime);
    }
  }

  numberOfTeams = 0;

  splitTeamRoom = (room) =>
  {
      let team = "A";

      for(let i = 0; i < 8; i++)
      {

        if(i == 4)
        {
          team = "B";
        }

        this.rooms_dictionary[`${room}`][i]['team'] = team
      }
  }

  addUserToRoom = (room_no = -1, username="", ROOM_SIZE=DEFAULT_ROOM_SIZE) => {

    let {rooms_dictionary, numberOfRooms, string_room} = this;
    let team = false;

    if(typeof(room_no) === 'string' &&
    room_no.includes('team'))
    {
      team = true;
      ROOM_SIZE = 8;
    }

    if(room_no == 'team-1')
    {
      room_no = `team${this.numberOfTeams}`;
    }

    if(room_no != -1)
    {
      /*I'm using a slick trick, if room_no is
      greater than -1, menaing the user does have
      a room number, then set numberOfRooms to
      that number, remember this doesn't effect
      this.numberOfRooms (the actual number representing
      the number of rooms), so numberOfRooms =/= this.numberOfRooms*/
      numberOfRooms = room_no
    }


    //methods.CleanRoom(rooms_dictionary, numberOfRooms);

    /*If the user doens't have a number AND the room at
    said number doesn't either, create it and increase
    the number so total rooms is updated and other players
    with no number can find it easily:
    */


    //If the room doesn't exist.
    if(!rooms_dictionary.hasOwnProperty(`${numberOfRooms}`))
    {
      this.createRoom(true, username, numberOfRooms, true);

      return numberOfRooms;
    }
    else {

      /*TEST 1:

      Check if the object ({...}) is in the room.
      if it is and the room is full, run the room*/

      let obj_inside= false;
      for(let i = 0; i < rooms_dictionary[`${numberOfRooms}`].length; i++)
      {
        if(rooms_dictionary[`${numberOfRooms}`][i].username == username)
        {
          obj_inside = true;
          break;
        }
      }

      //If the user's OBJ is inside the room already OR if
      //the room has a property "A", which means it was divided
      if(obj_inside &&
      rooms_dictionary[`${numberOfRooms}`].length == ROOM_SIZE)
      {

        //Make a new room.
        if(team)
        {
            this.splitTeamRoom(numberOfRooms)
        }

        return `${["running", numberOfRooms]}`;
      }

      /*TEST 1.5

      This is an extension of Test 1, if the object
      is inside the array BUT the room isn't full
      just return the room number */

      if(obj_inside &&
      rooms_dictionary[`${numberOfRooms}`].length < ROOM_SIZE)
      {
        return numberOfRooms
      }

      /* TEST 1 DIDN'T PASS, NOW FOR TEST 2:

      This IF block means that if the array doesn't
      include username and the room before addition is less
      than max size, then after add. is room_size execute
      this block*/

      if(!obj_inside &&
      rooms_dictionary[`${numberOfRooms}`].length < ROOM_SIZE )

      {
        /*If the room is less than ROOM_SIZE and doesn't
          include user, add him:
        */
        rooms_dictionary[`${numberOfRooms}`].push(
          {username: `${username}`, score: 0});

        /*If the room length NOW equals ROOM_SIZE as a result
        of adding user, run the room:
        */

        if(rooms_dictionary[`${numberOfRooms}`].length == ROOM_SIZE)
        {
          //Make a new room.
          if(!team)
          {
            this.createRoom();
          }
          if(team)
          {
              this.splitTeamRoom(numberOfRooms)

              //Makes a new team room
              this.numberOfTeams += 1;
          }
          return `${["running", numberOfRooms]}`;

        }

        return numberOfRooms;
      }

      // The special case for team rooms
      if(room_no.includes('team') &&
      rooms_dictionary[`${numberOfRooms}`].length >= ROOM_SIZE)
      {
        this.numberOfTeams++;
        return this.addUserToRoom(`team${this.numberOfTeams}`, username, DEFAULT_ROOM_SIZE);
      }

      //Case for regular number and string rooms
      if(rooms_dictionary[`${numberOfRooms}`].length >= ROOM_SIZE)
      {
          if(!string_room)
          {
            this.createRoom(true, username);
          }else{
            this.string_room = false;
            return this.addUserToRoom(-1, username, DEFAULT_ROOM_SIZE);
          }
          return this.numberOfRooms;
      }
    }
  }

  deleteUser = (username='', room=0) => {
    /* This is the function that deletes a user
    from a room if the user logs out/exits the app
    while in the waiting room */
    let {rooms_dictionary} = this;

    let index = 0;

    for(let i = 0; i < rooms_dictionary[`${room}`].length; i++)
    {
      if(rooms_dictionary[`${room}`][i].username == username)
      {
        index = i;
      }
    };

    rooms_dictionary[`${room}`].splice(index, 1);
  }
}

let room_manager = new RoomManager();

const DEFAULT_ROOM_SIZE = 6;


const app = express();

app.use(express.urlencoded({extended: false})); //Parses the request body
app.use(express.json());

const cors = require('cors');
app.use(cors());
app.use('/files', express.static('static'));


app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname+'/static/register.html'));
});

var now = moment("2021-02-06T10:05:29");
var a = moment_tz.utc(now).tz("Asia/Taipei");
b = now.utc().format();

//console.log(a.diff(b, 'minutes'));

app.post('/end_game', async (req, res) => {
    let user = req.body;
    let db_user_info;
    let done = false;
    console.log(user);
    await knx('users').where({
      'username': user.username,
    }).then(response => {
        if(response.length != 0)
        {
          db_user_info = response[0];
          }else{
          res.send("not ending game");
          done = true;
        }
    });

    if(!done)
    {
      if(user.combo > db_user_info.highest_combo)
      {
        console.log('good');
        await knx('users').where({
          'username': user.username,
        }).update({
          highest_combo: user.combo
        });
      }

      console.log(db_user_info)
      console.log(user.links);
      if(user.links > db_user_info.highest_links)
      {
        console.log('asda');
        await knx('users').where({
          'username': user.username,
        }).update({
          highest_links: user.links
        });
      }

      if(user.score > db_user_info.highest_score)
      {
        await knx('users').where({
          'username': user.username
        }).update({
          highest_score: user.score
        }).then(response => {
            res.send(`${db_user_info.win}, ${db_user_info.loss},
            ${db_user_info.highest_score}`);
        })
      } else {
        res.send(`${db_user_info.win}, ${db_user_info.loss},
        ${db_user_info.highest_score}`);
      }
    }
});

app.get('/get_leaderboard', async (req, res) => {
  await methods.Get_Leaders(res, knx);

});

app.get('/show_dictionary', (req, res) => {
    console.log(room_manager.rooms_dictionary);
    res.send(room_manager.rooms_dictionary);
})

app.post('/logout', (req, res) => {
    let u = req.body;

    knx('users').where('username', u.username).
    then(a => {
      if(a[0].password == u.password)
      {
        knx('users').where('username', u.username).
        update({
          online_status: "offline",
          meteors: 0
          }).then(a => {
          res.send('logged out');
        })
      }else {
        res.send('wrong pass');
      }
  });

})

app.post('/delete_from_room', (req, res) => {
  let user = req.body;

  if(user.room != null)
  {
    room_manager.deleteUser(user.username, user.room);
  }
  res.send("done");
});

app.get('/check_rooms', (req, res) => {

  let room_arg=req.query.room;
  room_manager.string_room = true;
  console.log(req.query);

  //if room_arg is a number
  if(!isNaN(parseInt(room_arg)))
  {
      room_arg = parseInt(room_arg);
      room_manager.string_room = false;
  }

  let result = room_manager.addUserToRoom(room_arg,
  req.query.username);

  res.send(`${result}`);

});

app.post('/check_in', (req, res) => {
    const u = req.body;
    res.send('done');
});

app.post('/send_result', async (req, res) => {
  const user = req.body;

  setTimeout(() => {
    delete room_manager.rooms_dictionary[`${user.room}`];
  }, 8000);

  if(user.room != null)
  {
    let result = methods.GetWinningTeam(room_manager.rooms_dictionary, user.room, user.name)
    await urls.SendResult(req, res, knx, user, false);
    return res.send(result)
  }
  else
  {
    await urls.SendResult(req, res, knx, user);
  }
})

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/static/index.html');
});


app.get('/leaderboards', (req, res) => {
	res.sendFile(__dirname + '/static/leaderboards.html');
});

app.use(express.static(__dirname + '/build/'));

app.get('/game', (req, res) => {
	res.sendFile(__dirname + '/build/index.html');
});

app.get('/get_users_in_room', (req, res) => {
  let params = req.query;

  if(params.room != '-1' &&
  room_manager.rooms_dictionary[`${params.room}`] != null)
  {
    const room = [room_manager.rooms_dictionary[`${params.room}`]];

    let usernames = room[0].map(user => {
      return user.username
    });

    //Basically stringifies the response so it can be read by unity
    res.send(`${usernames.map(a=>a)}`)

  }else{
    res.send("")
  }
})

app.post('/send_mets', async (req, res) => {

    let name = req.body.username;
    let room = req.body.room;
    let mets = req.body.mets;

    let auto_count = 0;

    console.log(`called by ${name}`);
    let user_arr;
    let user_exists = false;
    let user;

    room_manager.rooms_dictionary[`${room}`].map(user =>
    {
      if(methods.AUTO_NAMES.includes(user.username))
      {
        auto_count += 1;
      }
    });

    if(room.includes('team'))
    {
      if(auto_count >= 7)
      {
        return res.send('meteors sent');
      }
      let me = methods.GetUserInRoom(room_manager, room, name)[0];
      user_arr = methods.GetOtherTeam(room_manager, room, me.team);
      user = user_arr[Math.floor(Math.random() * user_arr.length)];
    } else
    {
      if(auto_count >= 5)
      {
        return res.send('meteors sent');
      }
      user_arr = methods.FilterRoomForUser(room_manager, room, name);
      user = user_arr[Math.floor(Math.random() * user_arr.length)];
    }

    let target_users_meteors = 0;

    await knx('users').where('username', user.username).
    then(found_user => {
      if(found_user.length == 1)
      {
        user_exists = true;
        target_users_meteors = found_user[0].meteors
      }else{
        user_exists = false;
        return res.send('error');
      }
    });

    if(user_exists)
    {
      await knx('users').where('username', user.username)
      .update({
        meteors: parseInt(mets) + parseInt(target_users_meteors)
      }).then(a => {
        res.send('meteors sent');
      }, a => {
        res.send("not send")
      })
    }
})

app.get('/get_mets', async (req, res) => {

  let params = req.query;
  let mets = 0;


  const user = await knx('users').where('username', params.username).
  then(user => {
    mets = user[0].meteors;
    return user[0];
  }).catch(e => {
    res.send(e);
  });

  await knx('users').where('username', params.username).
  update({meteors: 0}).then(a => {
      res.send(`${mets}`);
  });

});

app.get('/getopponentsscore', (req, res) => {
  const user = req.query;

  for(let i = 0; i < DEFAULT_ROOM_SIZE; i++)
  {
    if(room_manager.rooms_dictionary[`${user.room}`][i].username == user.username)
    {
      if(user.score != undefined)
      {
        room_manager.rooms_dictionary[`${user.room}`][i].score = parseInt(user.score);
      }
      break;
    }
  }

  let user_list = methods.FilterRoomForUser(room_manager, user.room, user.username)

  user_list_string = "";

  user_list.map(user => {
    user_list_string += `${user["username"]}, ${user["score"]}|`;
  })

  res.send(`${user_list_string}`);
});

app.post('/find_winner', (req, res) => {

});

app.get('/login', (req, res) => {
  const u = req.query;
  urls.login(req, res, u, knx);
});

app.post('/register', (req, res) => {
  const u = req.body;
  urls.createUser(req, res, u, knx);
});

app.listen(3000);
