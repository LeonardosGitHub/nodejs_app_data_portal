const http = require('http')
const fs = require('fs');
const qs = require('querystring');
const prettyHtml = require('json-pretty-html').default;
const { exec } = require("child_process");
const { getMaxListeners } = require('process');

const server = http.createServer(function(request, response) {
  console.dir(request.param)
  if (request.method == 'POST') {
    console.log('POST')
    var body = ''
    request.on('data', function(data) {
      body += data
      //console.log('Partial body: ' + body)
    })
    request.on('end', function() {
      //console.log('Body: ' + body)
      var outputFormatted = {}
      var post = qs.parse(body);
      outputFormatted[post.appName] = {"app_name": post.appName, "tenant": post.uniqId, "app_template": post.appType, "server_port": post.serverPort, "app_fqdn": post.appFqdn, "app_locations": {"datacenter_name": post.appDC, "prod_vip_address": "1.1.1.1", "alternate_vip_address": "2.2.2.2", "pool_members": {"member1": post.poolIP1, "member1state": post.stateIP1, "member2": post.poolIP2, "member2state": post.stateIP2}}};
      var nameOfAppJsonFile = `../app_repo_via_post/jsonAppData/${Object.keys(outputFormatted)[0]}_appData.json`;
      fs.writeFileSync(nameOfAppJsonFile, JSON.stringify(outputFormatted, null, " "));
      var prettyJsonHtml = prettyHtml(outputFormatted, outputFormatted);
      var html = `
            <html>
                <body style="background-color:lightgrey;">
                    </br><h1> Here is what was created: </h1></br></br>
                    ${prettyJsonHtml}
                </body>
            </html>`
      var gitCommand = `(cd ../app_repo_via_post/ && git status && git add . && git commit -m "commiting change to ${Object.keys(outputFormatted)[0]}_appData.json" && git push)`
      exec(gitCommand, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
      });
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(html);
    });
  } else {
    console.log('GET');
    var html = `
            <html>
                <body style="background-color:lightgrey;">
                    </br><h1>Application Intake</h1>
                    <form method="post" action="http://localhost:8080">
                    </br></br></br>
                    <b>What's the application unique ID?  
                    <input type="text" name="uniqId" value="tenant12345"/></br></br>
                    What's the application's name?  
                    <input type="text" name="appName" value="appX"/></br></br>
                    <label for="applicationType">Choose your app type:  </label>
                    <select name="appType" id="applicationType">
                    <option value="httpApp"> http </option>
                    <option value="tcpApp"> tcp </option>
                    </select></br></br>
                    What's the application's fqdn?  
                    <input type="text" name="appFqdn" value="appX.example1.com"/></br></br>
                    <label for="dataCenters">Select your application's DataCenter:  </label>
                    <select name="appDC" id="dataCenters">
                    <option value="virtual_DataCenter"> virtualDataCenter </option>
                    <option value="dmz_DataCenter"> dmzDataCenter </option>
                    </select></br></br>
                    Server port?  
                    <input type="text" name="serverPort" value="80"/></br></br>
                    First IP of the servers supporting this application?  
                    <input type="text" name="poolIP1" value="192.168.1.1"/>
                    <label for="poolIP1state">Enabled or Disabled?  </label>
                    <select name="stateIP1" id="poolIP1state">
                    <option value="enable"> Enable </option>
                    <option value="disable"> Disable </option>
                    </select></br></br>
                    Second IP of the servers supporting this application?  
                    <input type="text" name="poolIP2" value="192.168.1.2"/>
                    <label for="poolIP2state">Enabled or Disabled?  </label>
                    <select name="stateIP2" id="poolIP2state">
                    <option value="enable"> Enable </option>
                    <option value="disable"> Disable </option>
                    </select></br></br>
                    <input type="submit" value="Submit" /></br>
                    </form>
                </body>
            </html>`;
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(html)
  }
})

const port = 8080
const host = '127.0.0.1'
server.listen(port, host)
console.log(`Listening at http://${host}:${port}`)
