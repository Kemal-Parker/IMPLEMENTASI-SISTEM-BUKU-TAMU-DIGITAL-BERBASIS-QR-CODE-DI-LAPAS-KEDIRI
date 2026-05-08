fetch('http://0.0.0.0:3000/api/guests/history').then(res => res.text()).then(console.log).catch(console.error);
