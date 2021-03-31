
const submit = document.getElementById('submit');

submit.onclick = function()
{
  let name = document.getElementById('name').value;
  let pass = document.getElementById('password').value;

  fetch('http://localhost:3000/register', {
		method: 'post', //basically the 4 types of HTTP request, get, post, ect.
		headers: {'Content-Type': 'application/json'}, // these both need to be in quotes
		body: JSON.stringify({
			name: name,
			password: pass,
		}) // Remember the body is where the server get's the actual info
		//from, so all that user info is in the body.
	}).then(response => response.json()).then(response => {
    console.log('done');
    if(response.resp === "already")
    {
      document.getElementById('already').innerHTML = ' username already exists ';
      setTimeout(() => {
        document.getElementById('already').innerHTML = '';
      }, 3000);
    }else{
      document.getElementById('already').innerHTML = `Success! You can now login and play as ${name} `;
    }
  })
}
