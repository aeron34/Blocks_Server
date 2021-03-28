
function FilterRoomForUser(room_manager, room, name)
{
  return room_manager.rooms_dictionary[`${room}`].filter(user => {
    if(user['username'] != name && user['username']
    != null)
    {
      return user;
    }
  })
}

let AUTO_NAMES = [
  '2 Chainz',
  'Monochrome',
  'Sono3',
  'TotoVibe',
  '32Vella',
  'Bonaba',
  'Creeed232',
  'STHE3jj2',
  'Trolllz_mac',
  'Mac_n_Cheese',
  '24Nacos',
  'Tuco_Salamanca',
  'Android18',
]

async function Auto_Send_Mets(name, knx)
{
    let target_users_meteors = 0;

    await knx('users').where('username', name).
    then(found_user => {
      if(found_user.length == 1)
      {
        user_exists = true;
        target_users_meteors = found_user[0].meteors
      }else{
        user_exists = false;
        return;
      }
    });

    await knx('users').where('username', name)
    .update({
      meteors: 3 + parseInt(target_users_meteors)
    }).then(a => {
      return;
    }, a => {
      return;
    })
}

async function Auto_IncreaseScore(room, ROOM_SIZE, knx)
{

  if(room != undefined)
  {
    let dice = 0;

    if(room.length == ROOM_SIZE)
    {
      let add_score = (Math.random() * 1250);

      for(let i = 0; i < room.length; i++)
      {
        x = room[Math.floor(Math.random() * room.length)];

        if(AUTO_NAMES.includes(x.username))
        {
            x.score += parseInt(add_score);
            if(Math.floor(Math.random() * 6) <= 2)
            {
              target = room[Math.floor(Math.random() * room.length)];

              if(!AUTO_NAMES.includes(target.username))
              {
                  await Auto_Send_Mets(target.username, knx)
              }
            }
            break;
        }
      }
    }
  }
}

function Auto_Addtoroom(room_num, addUser, dictionary)
{
  if(dictionary[`${room_num}`] != undefined)
  {
    let name;

    //The name seleted is just going to be a random name
    name = AUTO_NAMES[Math.floor(Math.random() * AUTO_NAMES.length)];

    addUser(room_num, name);
  }
}

function GetUserInRoom(room_manager, room, name)
{
  return room_manager.rooms_dictionary[`${room}`].filter(user => {
    if(user['username'] == name)
    {
      return user;
    }
  });
}


function GetOtherTeam(room_manager, room, team)
{
  return room_manager.rooms_dictionary[`${room}`].filter(user => {
    if(user['team'] != team)
    {
      return user;
    }
  });
}


function GetWinningTeam(rooms_dictionary, room, name)
{
  let teamA = 0, teamB = 0;
  let myTeam ="";
  rooms_dictionary[`${room}`].map(player =>
  {
      if(player.username == name)
      {
        myTeam = player.team
      }
      if(player.team == "A")
      {
        teamA += player.score;
      }else{
        teamB += player.score;
      }
  })

  let result = "";

  if(teamA > teamB)
  {
    result = "A"
  }
  if(teamA < teamB)
  {
    result = "B"
  }
  if(teamA == teamB)
  {
    result = "DRAW"
  }

  if(myTeam == result)
  {
    result = "win"
  }else{
    result = "loss"
  }


  return result;
}

function CleanRoom(rooms_dictionary, room)
{
  if(!rooms_dictionary.hasOwnProperty(`${room}`))
  {
    return;
  }

  rooms_dictionary[`${room}`] = rooms_dictionary[`${room}`].filter(user => {
    if(user['username'] != null)
    {
      return user;
    }
  });
}

module.exports = {
  FilterRoomForUser,
  CleanRoom,
  GetUserInRoom,
  GetOtherTeam,
  GetWinningTeam,
  Auto_IncreaseScore,
  Auto_Addtoroom,
  AUTO_NAMES,
};
