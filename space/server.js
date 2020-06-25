const http = require('http')
const express = require('express')
const app = require('express')();
const path = require('path')
const host = '127.0.0.1';
const port = 5000;
 
app.set('views', path.join(__dirname, '/'))
app.set('view engine', 'html');
 
app.use(express.static('public'));

// ssl 인증서 적용시
//  const options = {
//      key  : fs.readFileSync('./ssl/knowledgetalk.key'),
//      cert : fs.readFileSync('./ssl/knowledgetalk.pem')
//  };
 
http.createServer(app).listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`)
});