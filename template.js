/*
    == HOW TO USE THIS SCRIPT ==
    node updateProductTags.js STORE_ID ACCESS_TOKEN CSV_FILE API_DELAY
    
    API_DELAY: Delay between api requests. Recommended value: 100

    == EXAMPLE OF SCRIPT USE ==
    node updateProductTags.js 817495 728c665704a66d08321012745a97053fef69c918 updateProductTags.csv 100

    == STRUCTURE OF CSV FILE ==
    Headers: Do not include headers!
    Rows: one row for each product id.
    Columns: Two columns separated by a comma. First column for product id, second column for tags. Tags should be separated by pipe symbols. For removing tags, leave the tags row empty.
    product_1,tag_1|tag_2|tag_3|tag_4
    product_2,
    product_2,tag_5|tag_6

    == EXAMPLE OF CSV FILE CONTENTS ==
    81549219,novedades|invierno
    81548755,novedades
    76281397,vintage|verano|oferta|premium
    81256193,

    == INDEX OF THIS SCRIPT ==
    1. Imports
    2. Declarations and Initializations
    3. Execution
*/

// 1. Imports
import fetch from 'node-fetch';
import fs from 'fs';

// 2. Declarations and Initializations
const storeId = process.argv[2];
const accessToken = process.argv[3];
const csvFile = process.argv[4];
const apiDelay = process.argv[5];
let csvAsArray;
let requestData;
let content;

const readCsvIntoArray = () => {
    csvAsArray = fs.readFileSync(csvFile, "utf8");
    csvAsArray = csvAsArray.split("\r\n");
    for (let i in csvAsArray) {
        csvAsArray[i] = csvAsArray[i].split(",");
    }
}

const performRequest = async (requestData) => {
    const response = await fetch(requestData.url, requestData.options);
    if (response.ok) {
        console.log(`\nUpdate for product ${requestData.productId} successful!`);
        content = `Product ID ${requestData.productId} | SUCCESS\n`;
        fs.appendFile(`log_updateProductTags_${storeId}`, content, err => {
            if (err) {
              console.error(err);
            }
          });
    } else {
        const responseError = await response.json();
        console.log(`\nUpdate for product ${requestData.productId} NOT successful! | Response code: ${response.status} | Response error: ${JSON.stringify(responseError)} | Request data: ${JSON.stringify(requestData)}`);
        content = `Product ID ${requestData.productId} | ERROR | Response code: ${response.status} | Response error: ${JSON.stringify(responseError)} | Request data: ${JSON.stringify(requestData)}\n`;
        fs.appendFile(`log_updateProductTags_${storeId}`, content, err => {
            if (err) {
              console.error(err);
            }
          });
    }
}

const mainProcess = () => {
    csvAsArray.forEach((productRow, i) => {
        setTimeout(() => {
            requestData = {
                "productId": productRow[0],
                "url": `https://api.tiendanube.com/v1/${storeId}/products/${productRow[0]}/`,
                "options":  {
                    'method': 'PUT',
                    'headers': {
                        'Authentication': `bearer ${accessToken}`,
                        'User-Agent': 'TS Tools',
                        'Content-Type': 'application/json'
                    },
                    'body': JSON.stringify({
                        "tags": `${productRow[1].replace(/\|/g,',')}`
                    })
                }
            }
            performRequest(requestData);
        }, i * apiDelay);
    });
}

// 3. Execution
readCsvIntoArray();
mainProcess();
