var Client = require('node-rest-client').Client;
var fs = require("fs");
var dateFormat = require('dateformat');
var now = new Date();

client = new Client();
// Provide user credentials, which will be used to log in to JIRA.
var loginArgs = {
    data: {
        "username": "YOUR_USER_NAME",
        "password": "YOUR_PASSWORD"
    },
    headers: {
        "Content-Type": "application/json"
    }
};
client.post("https://jira.qlikdev.com/rest/auth/1/session", loginArgs, function(data, response) {
    if (response.statusCode == 200) {
        console.log('succesfully logged in, session:', data.session);
        var session = data.session;
        // Get the session information and store it in a cookie in the header
        var searchArgs = {
            headers: {
                // Set the cookie from the session information
                cookie: session.name + '=' + session.value,
                "Content-Type": "application/json"
            },
            data: {
                // Provide additional data for the JIRA search. You can modify the JQL to search for whatever you want.
                jql: "status!=Closed AND type=Bug"
            }
        };

        //Make the request return the search results, passing the header information including the cookie.
        client.get("https://jira.qlikdev.com/sr/jira.issueviews:searchrequest-excel-current-fields/temp/SearchRequest.xls?jqlQuery=project+in+%28QPS%2C+QVN%2C+CP%29+AND+type+%3D+Bug+AND+status+%21%3D+Closed+AND+%22Team%28s%29%22+%21%3D+%22Content+Services%22&tempMax=1000", searchArgs, function(searchResult, response) {
            console.log('status code:', response.statusCode);
            var date1 = dateFormat(now, "yyyy-mm-dd")
            var path = "Bugs-" + date1 + ".xls"
            fs.writeFile(path, searchResult.toString('utf8'), function(error) {
                if (error) {
                    console.error("write error:  " + error.message);
                } else {
                    console.log("Successful Write to " + path);
                }
            });
        });

    } else {
        throw "Login failed :(";
    }
});
