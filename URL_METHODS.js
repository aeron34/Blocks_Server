
const createUser = (req, res, u, knx) => {
  knx('users').insert({
    username: u["name"],
    password: u["password"]
  }).returning('*').then(a => res.status(300).json({
    status: a
  }), a => {
    console.log('sop');
    res.json({resp: "already"})
  });
}

const login = (req, res, u, knx) => {

  knx('users').where({
      username: u.username,
      password: u.pass
    }).update({
      online_status: "online",
      meteors: 0
    }).then( a=> {
      if(a == 0)
      {
        return res.send('nope');
      }
      res.send('logged in');
    }).catch(e => {
      res.send('nope');
    });

};


async function SendResult(req, res, knx, user, sending=true)
{
  let result_num = 0;

  await knx('users').where({
    'username': user.username,
    'password': user.password
  }).then(response => {
    if(response.length > 0)
    {
      result_num = response[0][`${user.result}`] + 1;
    }
    if(response.length < 0 && sending){
      return res.send('user doesnt exist');
    }
  });



  if(result_num != 0)
  {
    let update_obj = {meteors: 0}
    update_obj[user.result] = result_num;

    await knx('users').where('username', user.username)
    .update(update_obj).then(response => {
      if(sending)
      {
        res.send('done');
      }
    }, reject => {
      if(sending)
      {
        res.send('not done')
      }
    })
  }
}

module.exports = {
  login,
  createUser,
  SendResult
};
