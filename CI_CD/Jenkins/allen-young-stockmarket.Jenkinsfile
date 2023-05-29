/*
Prerequisite
---------------------------------------------------
- This Jenkinsfile uses ssh and scp CLI programs on Linux.
ssh and scp CLI programs must be installed on the Jenkins server Linux computer
before executing this Jenkinsfile.  (For 'AWS LightSail' and 'AWS Fargate SSH-only' deployments only.)

- This Jenkinsfile uses sshpass CLI program on Linux.
sshpass CLI program must be installed on the Jenkins server Linux computer
before executing this Jenkinsfile.  (For 'AWS Fargate SSH-only' deployment only.)

- This Jenkinsfile uses AWS CLI program on Linux.
AWS CLI program must be installed and properly configured on the Jenkins server Linux computer
before executing this Jenkinsfile.  (For 'AWS Fargate blue/green deployment' deployment only.)


This Jenkinsfile clones the Allen Young's Stockmarket (public) GitHub repository to the Jenkins server Linux computer,
and tests the GitHub repository files before uploading the tested files to the deployment server.
As such, the Git CLI command isn't required on the deployment server.


Jenkins global credentials used in this Jenkinsfile
---------------------------------------------------
- aws-lightsail-server-ssh-username-with-private-key
AWS_LIGHTSAIL_SERVER_SSH_USERNAME
AWS_LIGHTSAIL_SERVER_SSH_PRIVATE_KEY

- aws-fargate-instance-ssh-username-with-password
AWS_FARGATE_INSTANCE_SSH_USERNAME
AWS_FARGATE_INSTANCE_SSH_PASSWORD

- paypal-live-api-client-id-with-app-secret
PAYPAL_LIVE_API_CLIENT_ID
PAYPAL_LIVE_API_APP_SECRET

- paypal-sandbox-api-client-id-with-app-secret
PAYPAL_SANDBOX_API_CLIENT_ID
PAYPAL_SANDBOX_API_APP_SECRET

- aws-api-access-key-id-with-secret-access-key
AWS_API_ACCESS_KEY_ID
AWS_API_SECRET_ACCESS_KEY

- ay-stockmarket-admin-username-with-password
AY_STOCKMARKET_ADMIN_USERNAME
AY_STOCKMARKET_ADMIN_PASSWORD


Jenkins pipeline parameters used in this Jenkinsfile
----------------------------------------------------
- ayStockmarketGithubRepositoryUrl

- ayStockmarketFrontendDeploymentType
    (Currently, only 'React' is supported.  'Angular', 'Vue', and '.NET' will be supported later.)

- ayStockmarketBackendDeploymentType
    (Currently, only 'Express.js' is supported.  'Next.js', 'Nest.js', 'Python Flask', 'Golang Gin', 'PHP Laravel', 
    'Ruby Roda', '.NET', 'Java Spring Boot', 'Kotlin Spring Boot', and 'Kotlin Ktor' will be supported later.)

- ayStockmarketFullstackDeploymentType
    (Currently, no full-stack framework is implemented.  'Python Django', 'Ruby on Rails', and 'PHP Laravel' 
    will be supported later.)


- ayStockmarketDeploymentPlatformType
    (Currently, only 'AWS LightSail' and 'AWS Fargate SSH-only' is supported.  'AWS Fargate blue/green deployment',
    'Microsoft Azure', 'Google Cloud', 'Oracle Cloud', and 'IBM Cloud' will be supported later.)

- awsLightSailServerIpAddress

- awsFargateInstanceIpAddress

- awsDeploymentRegion (Default is 'us-east-1')
*/

node { 
    stage('Preparation') { // for display purposes
        echo 'Preparing....'

        if (params.ayStockmarketFullstackDeploymentType == '') {
            echo "Preparing to deploy ${params.ayStockmarketFrontendDeploymentType} frontend, ${params.ayStockmarketBackendDeploymentType} backend Allen Young's Stockmarket web app to ${params.ayStockmarketDeploymentPlatformType}..."
        } else {
            echo "Preparing to deploy ${params.ayStockmarketFullstackDeploymentType} full-stack Allen Young's Stockmarket web app to ${params.ayStockmarketDeploymentPlatformType}..."    
        }        
        
        try {
            git url: params.ayStockmarketGithubRepositoryUrl, branch: 'main'
            //git url: params.ayStockmarketGithubRepositoryUrl, branch: 'main', changelog: false, poll: false
            // sh "git clone ${params.ayStockmarketGithubRepositoryUrl}"
        } catch (Exception e) {
            echo 'Exception occurred: ' + e.toString()

            error "Git repository fetch failure.  Aborting."
        }        
    }
    stage('Build') { 
        echo 'Building....'

        //create a deployment Docker container if this is AWS Fargate blue/green deployment deployment
        if (params.ayStockmarketDeploymentPlatformType == 'AWS Fargate blue/green deployment') {
            //(This will be completed and tested later)
            //def customImage = docker.build("my-image:${env.BUILD_ID}")
        } else {
            echo "Nothing to build for this deployment configuration."    
        } 
    }
    stage('Test') {
        echo 'Testing....'

        if (params.ayStockmarketDeploymentPlatformType == 'AWS LightSail' ||
            params.ayStockmarketDeploymentPlatformType == 'AWS Fargate SSH-only') {
            try {

                /*
                echo "${workspace}"
                echo "${pwd()}"
                dir("backend/Express.js") {
                    echo "${pwd()}"
                }

                echo "${DISPLAY}"
                def displayEnvironmentVariableValue = sh 'echo $DISPLAY'
                echo "${displayEnvironmentVariableValue}"                
                */

                /*
                sh '''
                    node backend/Express.js/server.js true true &
                    sleep 30
                    CI_CD/echo $PWD
                '''
                */

                /*
                sh '''
                    cd backend/Express.js
                    echo $PWD
                    cd ${workspace}/CI_CD
                    echo $PWD
                '''
                */

                sh '(pidof node && killall -9 node && sleep 10) || echo "No node process"'
                sh '(pidof http-server && killall -9 http-server && sleep 10) || echo "No http-server process"' 

                dir("frontend/React") {
                    echo "Performing npm install in ${pwd()}."
                    sh 'npm install'

                    echo "Performing the React app Jest snapshot and DOM tests."
                    //sh 'whoami > whoami.txt' //The user is jenkins when pipeline is executed.
                    sh 'npm test'
                }                     

                echo "Creating PayPal and AWS API credential files."
                //add /backend/Express.js/.env file for PayPal sandbox API testing.
                withCredentials([usernamePassword(credentialsId: 'paypal-sandbox-api-client-id-with-app-secret', 
                    passwordVariable: 'PAYPAL_SANDBOX_API_APP_SECRET', 
                    usernameVariable: 'PAYPAL_SANDBOX_API_CLIENT_ID')]) {

                    dir("backend/Express.js") {
                        sh 'echo CLIENT_ID=$PAYPAL_SANDBOX_API_CLIENT_ID > .env'
                        sh 'echo APP_SECRET=$PAYPAL_SANDBOX_API_APP_SECRET >> .env'
                    }                    
                }     
                //add /backend/Express.js/aws_config.json for accessing AWS API.
                //    In a later version, a better AWS API access method than placing a credential file
                //    on server should be used.                
                withCredentials([usernamePassword(credentialsId: 'aws-api-access-key-id-with-secret-access-key', 
                    passwordVariable: 'AWS_API_SECRET_ACCESS_KEY', 
                    usernameVariable: 'AWS_API_ACCESS_KEY_ID')]) {

                    def awsConfigEchoString = '{ \\"accessKeyId\\": \\"$AWS_API_ACCESS_KEY_ID\\", ' + 
                        '\\"secretAccessKey\\": \\"$AWS_API_SECRET_ACCESS_KEY\\", \\"region\\": \\"' +
                        params.awsDeploymentRegion + '\\" }'

                    echo "${awsConfigEchoString}"

                    dir("backend/Express.js") {
                        sh 'echo ' + awsConfigEchoString + ' > aws_config.json'
                        sh 'echo \'\' >> aws_config.json'
                    }                    
                }                           

                dir("backend/Express.js") {
                    echo "Performing npm install in ${pwd()}."
                    sh 'npm install'

                    echo "Performing the database API test."
                    sh 'rm allen_young_stockmarket.db'
                    sh 'cp "allen_young_stockmarket(original, no stock stats).db" allen_young_stockmarket.db'                    
                    sh 'node database-access-test.js'

                    echo "Performing the backend server REST API test with custom code."
                    sh 'rm *.pem'
                    sh 'mkcert -install'
                    sh 'mkcert localhost'                    
                    sh 'node server-test.js'

                    echo "Performing the backend server REST API test with Newman."
                    sh 'rm allen_young_stockmarket.db'
                    sh 'cp "allen_young_stockmarket(original, stock stats).db" allen_young_stockmarket.db'
                    def newmanApiTestshellCommand = 'node server.js true true & sleep 30 && ' + 
                        "cd \"${workspace}/CI_CD\"" + ' && newman run "Allen Young\'s Stockmarket Backend API test.postman_collection.json" --insecure'
                    sh newmanApiTestshellCommand
                    sh '(pidof node && killall -9 node && sleep 10) || echo "No node process"'


                    echo 'Performing the Selenium end-to-end tests.'  
                    sh 'rm allen_young_stockmarket.db'
                    sh 'cp "allen_young_stockmarket(original, stock stats).db" allen_young_stockmarket.db'                    
                    def seleniumEndToEndTestShellCommand = 'node server.js true true & ' +
                        "cd \"${workspace}/frontend/React\"" + ' && http-server -p 80 & sleep 30 && ' +
                        "cd \"${workspace}/CI_CD\"" + ' && python3 selenium-e2e-test.py ' +
                        "\"${workspace}/backend/Express.js\" " +
                        "\"${workspace}/frontend/React\""                  
                    sh seleniumEndToEndTestShellCommand   
                    sh '(pidof node && killall -9 node && sleep 10) || echo "No node process"'
                    sh '(pidof http-server && killall -9 http-server && sleep 10) || echo "No http-server process"'                            

                    /*
                    sh """
                        node server.js true true &
                        cd \"${workspace}/frontend/React\"
                        http-server -p 80 &
                        sleep 30
                        cd \"${workspace}/CI_CD\"
                        echo $PWD
                    """      
                    */                 
                }
            } catch (Exception e) {
                echo 'Exception occurred: ' + e.toString()

                error "Testing failure.  Aborting."
 
                sh '(pidof node && killall -9 node && sleep 10) || echo "No node process"'
                sh '(pidof http-server && killall -9 http-server && sleep 10) || echo "No http-server process"'                               
            } 
        } else {
            //(This will be completed and tested later)
            //AWS Fargate blue/green deployment
            customImage.inside {
                sh 'node server.js true true &'
                sh 'sleep 20'
                sh 'http-server -p 80 &'
                sh 'sleep 15'
                sh 'node database-access-test.js'
                sh 'server-test.js'
                sh 'newman ...'
                sh 'npm test'  //React app Jest tests 
                sh 'python selenium-e2e-test.py'
            }            
        }  
    }

    error "Exiting to bypass further Jenkinsfile code execution (for gradual Jenkinsfile development and testing)."

    /*
    [5/26/2023 1:14 PM CST]
    The deployment automation code below is currently uncompleted and untested, because of lacking access to 
    my Linux computer with Jenkins and Docker installed.  I'll have access to my Linux computer on 6/11/2023.
    I'll complete and test the below code as soon as I can.
    */
    if (currentBuild.currentResult == 'SUCCESS') {
        stage('Deploy') {
            echo 'Deploying....'

            error "Exiting to bypass further Jenkinsfile code execution (for gradual Jenkinsfile development and testing)."

            echo "ayStockmarketGithubRepositoryUrl:  ${params.ayStockmarketGithubRepositoryUrl}"
            echo "ayStockmarketFrontendDeploymentType:  ${params.ayStockmarketFrontendDeploymentType}"
            echo "ayStockmarketBackendDeploymentType:  ${params.ayStockmarketBackendDeploymentType}"
            echo "ayStockmarketFullstackDeploymentType:  ${params.ayStockmarketFullstackDeploymentType}"
            echo "ayStockmarketDeploymentPlatformType:  ${params.ayStockmarketDeploymentPlatformType}"
            echo "awsLightSailServerIpAddress:  ${params.awsLightSailServerIpAddress}"
            echo "awsFargateInstanceIpAddress:  ${params.awsFargateInstanceIpAddress}"

            if (${params.ayStockmarketDeploymentPlatformType == 'AWS LightSail'}) {
                //Deploy by executing AWS CLI command(s)

                //ssh -i "C:\Users\Allen\Documents\Asian-American Man\AWS\LightsailDefaultKey-us-east-1.pem" bitnami@54.88.122.32 'date > /home/bitnami/test-remote-command-execution.txt'
                //
                //sudo /opt/bitnami/ctlscript.sh stop
                //'(pidof node && killall -9 node && sleep 10) || echo "No node process"'
                //'(pidof http-server && killall -9 http-server && sleep 10) || echo "No http-server process"'
                //scp or git-clone execution on the AWS LightSail instance?  think, decide, and then implement the decision!
                //  I'm leaning toward using git-clone since 'npm install' is required anyway.
                //AWS LightSail instance web app files content update (likely a separate Groovy function at the top or bottom in this Jenkinsfile)
                //  TO DO specify another Jenkins pipeline parameter for specifying the web app domain name or URL
                //  that will be used in updating the web app files content
                //  UPDATE, CHANGE IN PLAN Decide on, and implement, whether to use a separate Python program 
                //  for Allen Young’s Stockmarket file contents replacement.  I'm very heavily leaning toward 
                //  doing this, since this can run anywhere even and especially without Jenkins.  
                //  Use a Python class method with file full path and variable arguments for the strings to replace.
                //  This file-content-replacer Python program should take a plain text file with
                //  rows of relative file paths and strings to replace as in the following,
                //  and process it to build a dictionary that maps the relative file path
                //  to the dictionary that maps string to replace to replacement string.
                //  (relative file path)\t(string to replace)\t(replacement string)
                //  Alright, I'm definitely implementing this file-content-replacer Python program,
                //  and putting it and using it in the CI_CD directory!
				//  tab-delimited row, not quotation-marks delimited.
                //
                //  scp file-content-replacer.py and file-content-replacement-list.txt to the AWS LightSail instance.
                //  then execute file-content-replacer.py with the right arguments.
                //node server.js true true &
                //  TO DO specify another Jenkins pipeline parameter for specifying the backend port number
                //http-server -p xxxx
                //  TO DO specify another Jenkins pipeline parameter for specifying the frontend port number
                //sudo /opt/bitnami/ctlscript.sh start
                //
                //another parameter needed cert.pem file location path for "http-server -p 8889 -S -C cert.pem -K key.pem".
                //another parameter needed key.pem file location path for http-server in https mode.
                //http-server -p 8889 -S -C /opt/bitnami/letsencrypt/certificates/robocentric.com.crt -K /opt/bitnami/letsencrypt/certificates/robocentric.com.key
                //
                //"rm -r -f ~/stockmarket" to remove all the existing Git repository clone.
                //
                //Place .env and aws_config.json files in the deployed Express.js directory.
                //Place ServerUrl.js file in the deployed React\settings directory.
                //
                //Must replace the React library URLs in all of the React app HTML files.
                //Find a way to do this in the most proper fashion.
                //For now, I'm leaning toward executing a single Linux command to replace string
                //in multiple files.  That will require executing only two commands.

                withCredentials([usernamePassword(credentialsId: 'allen-young-credentials', passwordVariable: 'AY_PASSWORD', usernameVariable: 'AY_USERNAME')]) {
                    // some block
                    echo '$AY_USERNAME'
                    echo '$AY_PASSWORD'

                    sh 'aws ...' 



                    //Add /backend/Express.js/.env file for PayPal live API.
                    //Modify the admin user entry email-address and password in allen_young_stockmarket.db.

                    //(Update the server.js content to use Let's Encrypt SSL on the production backend.)
                }
            } else {
                //AWS Fargate

                //[5/25/2023 10:13 PM CST]
                //Note that the AWS Fargate instance must be already running.
                //I'll later update this Jenkinsfile for building the Docker image in Jenkins pipeline,
                //then doing AWS Fargate blue/green deployment in Jenkins pipeline.

                //Deploy by executing AWS CLI command(s)
                sh 'aws ...'                 
            }             
        }
    } else {
        //Email the admin by executing an AWS CLI command
    }
}