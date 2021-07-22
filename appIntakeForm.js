const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const yaml = require('js-yaml');
const { exec } = require("child_process");


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
      var serverPortNum = parseInt(post.serverPort)
      //console.log(post);
      outputFormatted[post.appName] = {"app_name": post.appName, "tenant": post.uniqId, "app_template": post.appType, "server_port": serverPortNum, "app_fqdn": post.appFqdn, "app_locations": {"datacenter_name": post.appDC, "prod_vip_address": post.prod_vip_address, "alternate_vip_address": post.alternate_vip_address, "pool_members":[{"ip": post.poolIP1, "state": post.stateIP1}, {"ip": post.poolIP2, "state": post.stateIP2}]}};
      var nameOfAppJsonFile = `../app_repo_via_post/${Object.keys(outputFormatted)[0]}.yaml`;
      fs.writeFileSync(nameOfAppJsonFile, yaml.safeDump(outputFormatted));   //outputs data as yaml
      var html = `
            <html>
                <body style="background-color:lightgrey;">
                    </br><h1> Follow link to view contents of repo, the change you made should appear shortly</h1></br></br>
                    <h2><a href="https://github.com/LeonardosGitHub/app_repo_via_post/tree/main/" target="_blank">Visit this link to view your change</a></h2>
                </body>
            </html>`
      var gitCommand = `(cd ../app_repo_via_post/ && git status && git add . && git commit -m "commiting change to ${Object.keys(outputFormatted)[0]}.yaml" && git push)`
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
                    <option value="template_as3_web_app"> http </option>
                    <option value="tcpApp"> tcp </option>
                    </select></br></br>
                    What's the application's fqdn?  
                    <input type="text" name="appFqdn" value="appX.example1.com"/></br></br>
                    <label for="dataCenters">Select your application's DataCenter:  </label>
                    <select name="appDC" id="dataCenters">
                    <option value="virtual_DataCenter"> virtualDataCenter </option>
                    <option value="dmz_DataCenter"> dmzDataCenter </option>
                    </select></br></br>
                    Virtual Server address: <input type="text" name="prod_vip_address" value="1.1.1.X"/></br></br>
                    Alternate Virtual Server address: <input type="text" name="alternate_vip_address" value="2.2.2.X"/></br></br>
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
const host = 'localhost'
server.listen(port, host)
console.log(`Listening at http://${host}:${port}`)
