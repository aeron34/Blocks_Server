const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.urlencoded({extended: false})); //Parses the request body
app.use(express.json());


app.use(cors());
app.use('/files', express.static('static'));


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aerosemail12@gmail.com',
    pass: '$Onic1991'
  }
});

app.get('/send_free_email', (req, res) => {
  var mailOptions = {
    from: 'aerosemail12@gmail.com',
    to: 'sniperud@gmail.com',
    subject:'Free shit.',
    text: 'free tier dood'
  };

    transporter.sendMail(mailOptions, function(err, info) {
      console.log(`${err} ${info}`);
      res.send('done')
    })
});

app.get('/send_paid_email', (req, res) => {
  var mailOptions = {
    from: 'aerosemail12@gmail.com',
    to: 'sniperud@gmail.com',
    subject:'Paid Sign Up!',
    text: 'someone signed up for paid'
  };

    transporter.sendMail(mailOptions, function(err, info) {
      console.log(`${err} ${info}`);
      res.send('done')

    })
});


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

app.listen(process.env.PORT);
