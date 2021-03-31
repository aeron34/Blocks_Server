const leader_boxes = document.getElementById('leader_boxes');


fetch('http://linxthegame.com/get_leaderboard')
.then(list => list.json()).then(list => {

  let props = ['highest_score', 'highest_links', 'highest_combo'];

  for(let i = 0; i < 3; i++)
  {
    const container_div = document.getElementById(`${props[i]}`);


    list[i].map(user => {

      const main_div = document.createElement('DIV');
      main_div.className = '_leader_box';
      color = ['yellow', 'red', 'blue', 'green']

      let x = Math.floor(Math.random() * color.length);

      let img = document.createElement('IMG');
      img.width = '32';
      img.height = '32';
      img.style.marginTop = 'auto';
      img.style.marginBottom = 'auto';
      img.src = `files/images/${color[x]}.png`

      let info = document.createElement('DIV');

      let name = document.createElement('H2');
      name.innerHTML = `${user.username}`;

      let text = document.createElement('H2');
      text.innerHTML = `${(props[i].substring(8)).toUpperCase()}: ${user[props[i]]}`;


      main_div.appendChild(img);
      info.appendChild(name);
      info.appendChild(text);
      main_div.appendChild(info);
      container_div.appendChild(main_div)

    })

    leader_boxes.appendChild(container_div);

  }
});
