// Import Dependencies 
// Axios is an http client to call the C4C API
const axios = require('axios');

// Form data provides the means to create multipart/form-data requests
const FormData = require('form-data')


// supported image content types and the matching file names 
// file names are used, as images embeded into an html e-mail
// come with file names that are not accepted by the image classifier
const validMimeTypes = ["image/jpeg", "image/png", "image/tif", "image/bmp"];

const validMimeTypesMapping = [
    { mimeType: "image/jpeg", fileName: "image.jpg" },
    { mimeType: "image/png", fileName: "image.png" },
    { mimeType: "image/tif", fileName: "image.tif" },
    { mimeType: "image/bmp", fileName: "image.bmp" }];

// Mapping of image classes to C4C object category IDs, normally this would be a more 
// sophisticated mechanism        
const labelMap = {
    "mice": "PS-MICE",
    "digital cameras": "PS-DIGITAL_CAMERAS"
}


//Assemble headers for C4C for local testing (APPGW_HOST)
const c4cHeaders = {
    'Accept': 'application/json'
};

if (process.env.hasOwnProperty("APPGW_HOST")) {
    c4cHeaders.Host = process.env.APPGW_HOST;
}

// Create http client for C4C
const c4cClient = axios.create({
    baseURL: process.env.GATEWAY_URL,
    timeout: 20000,
    headers: c4cHeaders
});

// Create http client for Leonardo Service
const leonardoClient = axios.create({
    baseURL: process.env.LEONARDO_URL,
    timeout: 20000,
    headers: {
        'APIKey': process.env.APIKEY,
        'Accept': 'application/json'
    }
});


//Helper function to determine "neutral" file name 
//for image classifier
function getMimeTypeFileName(mimeType) {
    for (i in validMimeTypesMapping) {
        if (validMimeTypesMapping[i].mimeType === mimeType) {
            return validMimeTypesMapping[i].fileName;
        }
    }
    throw `mime type ${mimeType} not supported`;
}



//Function that checks whether Service Request was
//created through e-mail
async function hasServiceRequestEMailOrigin(serviceRequestObjectID) {

    try {
        var response = await c4cClient.get(`/ServiceRequestCollection('${serviceRequestObjectID}')?$select=DataOriginTypeCode`);

        if (response.data.d.results.DataOriginTypeCode !== "5") {
            return false;
        } else {
            return true;
        }

    } catch (error) {
        throw {
            "error": "Retrieval of Service Request Origin failed",
            "errorDetail": error
        }
    }
}


// Function to read original E-Mail Entity from C4C
async function getEmailID(serviceRequestObjectID) {
    try {
        var response = await c4cClient.get(`/ServiceRequestCollection('${serviceRequestObjectID}')/ServiceRequestBusinessTransactionDocumentReference?$filter=TypeCode eq '39'&$orderby=ETag asc&$select=ID`);
        if (response.data.d.results.length < 1) {
            console.log("Response does not contain e-mail IDs");
            return "";
        }
        return response.data.d.results[0].ID;
    } catch (error) {

        throw {
            "error": "Retrieval of E-Mail ID failed",
            "errorDetail": error
        }
    }
}

// Function to read attachment images from C4C
async function getAttachmentImages(EmailID) {
    try {
        var response = await c4cClient.get(`EMailCollection?$filter=ID eq '${EmailID}'&$expand=EMailAttachments&$select=EMailAttachments/MimeType,EMailAttachments/Binary,EMailAttachments/Name`);

        if (response.data.d.results.length < 1) {
            throw `E-mail for ID ${EmailID} not found`;
        }

        //loop over attachments and retrieve only images

        var result = [];
        for (i in response.data.d.results[0].EMailAttachments) {
            var attachment = response.data.d.results[0].EMailAttachments[i];

            if (validMimeTypes.includes(attachment.MimeType.toLowerCase())) {

                result.push({
                    filename: getMimeTypeFileName(attachment.MimeType.toLowerCase()),
                    contentType: getMimeTypeFileName,
                    base64String: attachment.Binary
                });

                console.log(`${attachment.MimeType} ${attachment.Name} read`)

            } else {
                console.log(`${attachment.MimeType} is not a valid image`);
            }
        }

        return result;


    } catch (error) {
        throw {
            "error": "Retrieval of E-Mail Attachment Image failed",
            "errorDetail": error
        }
    }
}


// Determine image class through machine learning service
async function getImageClassification(image, retry) {

    if (retry === undefined) { retry = 0 };
    try {
        var decodedFile = new Buffer(image.base64String, 'base64')
        var formData = new FormData();
        formData.append('files', decodedFile, { filename: image.filename, contentType: image.contentType });
        var response = await leonardoClient.post("/inference_sync", formData, { headers: formData.getHeaders() });

        if (response.data.predictions[0].results.length < 1) {
            return "";
        }
        console.log("Identified the following Image classes:");
        console.log(response.data.predictions[0].results);

        return response.data.predictions[0].results[0].label;

    } catch (error) {
        if (retry < 5) {
            retry++;
            console.log(`Retrying image classification for ${image.filename}. Retry number ${retry}`);
            return getImageClassification(image, retry);
        } else {

            throw {
                "error": "Image Classification failed",
                "errorDetail": error
            }
        }
    }
}


//Convert KLeonardo Classification to C4C Category helper 
//function
function mapLabelToC4C(labels) {

    for (i in labels) {

        if (labelMap.hasOwnProperty(labels[i])) {
            return labelMap[labels[i]];
        }
    }

    return "";

}

// Update Category Mapping on C4C Service Request
async function updateLabel(serviceRequestID, c4cLabel) {
    try {

        await c4cClient.patch(`ServiceRequestCollection('${serviceRequestID}')`, { ObjectServiceIssueCategoryID: c4cLabel });

    } catch (error) {
        throw {
            "error": "Updating C4C failed",
            "errorDetail": error
        }
    }
}

// Main Function of Lambda 
module.exports = {
    main: async function (event, context) {
        try {
            // Extract Service Request UUID from Event Payload
            var serviceRequestID = event.data["entity-id"];
            console.log(`Classifying Service Request: ${serviceRequestID}`);

            //Check if source is e-mail, as otherwise there will be no e-mail attachments ;-)
            if (await hasServiceRequestEMailOrigin(serviceRequestID)) {
                // Extract original E-Mail ID of Service Request
                var emailID = await getEmailID(serviceRequestID);

                console.log(`Original E-Mail ID: ${emailID}`)

                // Extract Image Attachments of E-Mail
                var images = await getAttachmentImages(emailID);


                // Classify Images using Image Classifier (in parallel)

                var labels = images.map(image => getImageClassification(image));
                labels = await Promise.all(labels);
                labels = labels.filter(label => label !== "");

                // Map Leonardo Labels to C4C Classifications
                var c4cLabel = mapLabelToC4C(labels);

                console.log(`Updating C4C with Classification value '${c4cLabel}'`)

                // Update C4C only if something was found ;-)
                if (c4cLabel !== "") {
                    await updateLabel(serviceRequestID, c4cLabel);
                }
            } else {
                //Service reuest does not originate from e-mail, sleep
                console.log(`${serviceRequestID}, does not originate from an e-mail, no further action`);
            }

            // Log call as success (no retry)
            event.extensions.response.status(200).send();

        } catch (error) {
            console.log(error);
            // Log call as error (retry)
            event.extensions.response.status(500).send();
        }
    }
}
