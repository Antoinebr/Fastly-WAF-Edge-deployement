const dotenv = require('dotenv');
dotenv.config();

const EventEmitter = require('events');
const myEmitter = new EventEmitter();

const {createEdgeSecurityService,getGetSecurityService,mapEdgeSecurityServiceToFastly,removeEdgeDeployment,detachEdgeDeploymentService} = require('./edgeService');

const {askQuestion} = require('./askQuestion');




if(!process.env.SIGSCI_EMAIL) throw new Error('The SIGSCI_EMAIL is required, nothing has been found in the .env');
if(!process.env.SIGSCI_TOKEN) throw new Error('The SIGSCI_TOKEN is required, nothing has been found in the .env');
if(!process.env.FASTLY_KEY) throw new Error('The FASTLY_KEY is required, nothing has been found in the .env');


if(!process.env.corpName) throw new Error('The corpName is required, nothing has been found in the .env');
if(!process.env.siteShortName) throw new Error('The siteShortName is required, nothing has been found in the .env');
if(!process.env.fastlySID) throw new Error('The fastlySID is required, nothing has been found in the .env');


const corpName = process.env.corpName;
const siteShortName = process.env.siteShortName;
const fastlySID = process.env.fastlySID;




(async() => {


    console.log(`
    -----------------------------------------------------
    Menu
    -----------------------------------------------------

    🌎 : edgeSecurityServiceCreation - [1]

    🔒 : getGetSecurityService - [2]

    🔗 : mapEdgeSecurityServiceToFastly - [3]

    💥 : detachEdgeDeploymentService - [4]

    ❌ : removeEdgeDeployment - [5]

    -----------------------------------------------------
    `);


    const optionChosen = await askQuestion("Choose an option by inputing the number, then hit enter :");

    const optionChosenAsInt = parseInt(optionChosen);

    if(optionChosenAsInt <= 0 || optionChosenAsInt >5){
        console.log('❌ Invalid option... Bye bye...');
        process.exit();
    } 

    if(optionChosenAsInt === 1) myEmitter.emit('edgeSecurityServiceCreation');

    if(optionChosenAsInt === 2) myEmitter.emit('getGetSecurityService');

    if(optionChosenAsInt === 3) myEmitter.emit('mapEdgeSecurityServiceToFastly');

    if(optionChosenAsInt === 4) myEmitter.emit('detachEdgeDeploymentService');

    if(optionChosenAsInt === 5) myEmitter.emit('removeEdgeDeployment');
    
    

})();

/**
 * 
 *  CREATE edgeSecurityService 🌎 
 * 
 */
myEmitter.on('edgeSecurityServiceCreation', async () => {

    const wantsToContinue = await askQuestion(`\nYou are about to create a WAF edge deployement, for corpName : ${corpName} and siteShortName ${siteShortName}  continue ? [Y/N]`);

    if(wantsToContinue && wantsToContinue.toLowerCase() === "n") process.exit();

    const edgeSecurityServiceCreation = await createEdgeSecurityService(corpName, siteShortName);

    if(typeof edgeSecurityServiceCreation !== "object") throw new Error('Unfortunetly the edgeSecurityServiceCreation failed');
    
    console.log(`✅ edgeSecurityServiceCreation : Service created 🌎`);
    process.exit();
    
});

/**
 * 
 *  GET getGetSecurityService 🔒
 * 
 */
myEmitter.on('getGetSecurityService', async () => {

    console.log(`Getting security service for ${corpName} and siteShortName ${siteShortName}`);

    try {
        const securityServ = await getGetSecurityService(corpName, siteShortName);

        if(securityServ.status === 200 ) console.log( `\n\n mapEdgeSecurityServiceToFastly worked ✅ 🎉  \n\n ${JSON.stringify(securityServ.data)} \n\n`);
   
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code that falls out of the range of 2xx
            if (error.response.status === 404) {
                console.error(`No SecurityService found, did you create one?`);
                return;
            }
            console.error(`Error: ${error.response.status} - ${error.response.statusText}`);
            return;
        }
        if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            return;
        }
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error.message);
    }

    process.exit();

});

/*
*
* Mapping to the Fastly service 🔗 
*
*/
myEmitter.on('mapEdgeSecurityServiceToFastly', async () => {

    const wantsToContinue = await askQuestion(`\nYou are about to mapEdgeSecurityServiceToFastly, for corpName : ${corpName}, siteShortName ${siteShortName} and fastlySID ${fastlySID} continue ? [Y/N]`);

    if(wantsToContinue && wantsToContinue.toLowerCase() === "n") process.exit();

    let mapingResult;
    let statusCode;

    do {
        mapingResult = await mapEdgeSecurityServiceToFastly(corpName, siteShortName, fastlySID);
        statusCode = mapingResult ? mapingResult.status : null;

        if (statusCode !== 200) {
            console.log(`Received status code ${statusCode}. Retrying in 3 seconds...`);
            await new Promise( (resolve, reject) => setTimeout( () => resolve(), 3000 ));
        }

    } while (statusCode !== 200);

    console.log(`\n\n mapEdgeSecurityServiceToFastly worked ✅ 🎉 \n\n`);
    console.log(mapingResult.data);
    console.log("Good Bye 👋");
    process.exit();

});

/*
*
* 
*
*/
myEmitter.on('detachEdgeDeploymentService', async () => {

    const wantsToContinue = await askQuestion(`\nYou are about to detachEdgeDeploymentService, for corpName : ${corpName}, siteShortName ${siteShortName} and fastlySID ${fastlySID} continue ? [Y/N]`);

    if(wantsToContinue && wantsToContinue.toLowerCase() === "n") process.exit();

    console.log(`Detaching EdgeDeploymentService....`);
    const detachResult = await detachEdgeDeploymentService(corpName,siteShortName,fastlySID).catch( e => console.error(e));
    if(detachResult.status !== 200)  throw new Error('Unfortunetly the detachEdgeDeploymentService failed');

    console.log(`\n\n detachEdgeDeploymentService worked ✅ 🎉 \n\n`);
    console.log(detachResult.data);
    console.log("Good Bye 👋");
    process.exit();

});

/*
*
* 
*
*/
myEmitter.on('removeEdgeDeployment', async () => {

    const wantsToContinue = await askQuestion(`\nYou are about to removeEdgeDeployment, for corpName : ${corpName}, siteShortName ${siteShortName} and fastlySID ${fastlySID} continue ? [Y/N]`);

    if(wantsToContinue && wantsToContinue.toLowerCase() === "n") process.exit();

    console.log(`Removing the EdgeDeployment....`);

    const removeResult = await removeEdgeDeployment(corpName, siteShortName);
    if(removeResult.status !== 204 && removeResult.status !== 200)  throw new Error('Unfortunetly the removeEdgeDeployment failed');
    console.log(`\n\n removeEdgeDeployment worked ✅ 🎉 \n\n`);
    console.log(removeResult.data);


    console.log("Good Bye 👋");
    process.exit();

});

