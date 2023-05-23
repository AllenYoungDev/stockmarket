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
PAYPAL-LIVE-API-CLIENT-ID
PAYPAL-LIVE-API-APP-SECRET

- paypal-sandbox-api-client-id-with-app-secret
PAYPAL-SANDBOX-API-CLIENT-ID
PAYPAL-SANDBOX-API-APP-SECRET

- aws-api-access-key-id-with-secret-access-key
AWS-API-ACCESS-KEY-ID
AWS-API-SECRET-ACCESS-KEY

- ay-stockmarket-admin-username-with-password
AY-STOCKMARKET-ADMIN-USERNAME
AY-STOCKMARKET-ADMIN-PASSWORD


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

        echo "${workspace}"

        error "Exiting to bypass further Jenkinsfile code execution (for gradual Jenkinsfile development and testing)."

        echo "ayStockmarketGithubRepositoryUrl:  ${params.ayStockmarketGithubRepositoryUrl}"
        echo "ayStockmarketFrontendDeploymentType:  ${params.ayStockmarketFrontendDeploymentType}"
        echo "ayStockmarketBackendDeploymentType:  ${params.ayStockmarketBackendDeploymentType}"
        echo "ayStockmarketFullstackDeploymentType:  ${params.ayStockmarketFullstackDeploymentType}"
        echo "ayStockmarketDeploymentPlatformType:  ${params.ayStockmarketDeploymentPlatformType}"
        echo "awsLightSailServerIpAddress:  ${params.awsLightSailServerIpAddress}"
        echo "awsFargateInstanceIpAddress:  ${params.awsFargateInstanceIpAddress}"

        if (params.ayStockmarketDeploymentPlatformType == 'AWS LightSail' ||
            params.ayStockmarketDeploymentPlatformType == 'AWS Fargate SSH-only') {
            try {
                //add /backend/Express.js/.env file for PayPal sandbox API testing.
                //add /backend/Express.js/aws_config.json for accessing AWS API.
                //    In a later version, a better AWS API access method than placing a credential file
                //    on server should be used.

                sh 'cd ...'
                sh 'set DEBUG=*'
                sh 'node server.js true true &'
                sh 'sleep 20'
                sh 'http-server -p 80 &'
                sh 'sleep 15'
                sh 'node database-access-test.js'
                sh 'server-test.js'
                sh 'newman ...'
                sh 'npm install'
                sh 'npm test'  //React app Jest tests 
                sh 'python selenium-e2e-test.py'
                sh 'killall node'
                sh 'unset -f DEBUG'
            } catch (Exception e) {
                echo 'Exception occurred: ' + e.toString()

                error "Testing failure.  Aborting."
            } 
        } else {
            //(This will be completed and tested later)
            //AWS Fargate blue/green deployment
            customImage.inside {
                sh 'set DEBUG=*'
                sh 'node server.js true true &'
                sh 'sleep 20'
                sh 'http-server -p 80 &'
                sh 'sleep 15'
                sh 'node database-access-test.js'
                sh 'server-test.js'
                sh 'newman ...'
                sh 'npm test'  //React app Jest tests 
                sh 'python selenium-e2e-test.py'
                sh 'killall node'
                sh 'unset -f DEBUG'
            }            
        }  
    }
    if (currentBuild.currentResult == 'SUCCESS') {
        stage('Deploy') {
            echo 'Deploying....'

            if (${params.ayStockmarketDeploymentPlatformType == 'AWS LightSail'}) {
                //Deploy by executing AWS CLI command(s)

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

                //Deploy by executing AWS CLI command(s)
                sh 'aws ...'                 
            }             
        }
    } else {
        //Email the admin by executing an AWS CLI command
    }
}