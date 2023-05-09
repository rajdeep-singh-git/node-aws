const AWS = require('aws-sdk');
const fs = require('fs');

AWS.config.update({
    accessKeyId: process.env.aws_key,
    secretAccessKey: process.env.aws_secret,
    region: process.env.aws_region
});

const s3 = new AWS.S3();

exports.uploadS3 = (file) => {

    const fileStream = fs.createReadStream(file.tempFilePath)

    const params = {
        Bucket: process.env.aws_bucket,
        Key: 'images/' + file.name,
        Body: fileStream,
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, function (err, data) {
            if (err) {
                console.log('Error uploading file:', err);
                reject(err);
            } else {
                console.log('File uploaded successfully:', data);
                resolve(data);
            }
        });
    })


}

exports.listFiles = () => {
    const params = {
        Bucket: process.env.aws_bucket,
        Prefix: "teachers/reports/"
    };
    return new Promise((resolve, reject) => {
        s3.listObjectsV2(params, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data.Contents)
            }
        });
    })
}

exports.deleteFolder = (key) => {
    const bucketName = process.env.aws_bucket;
    folderName = key;
    return new Promise((resolve, reject) => {
        s3.listObjects({ Bucket: bucketName, Prefix: folderName }, (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            const objects = data.Contents.map(({ Key }) => ({ Key }));

            if (objects.length === 0) {
                // If the folder is empty, delete the folder itself
                s3.deleteObject({ Bucket: bucketName, Key: folderName }, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(data)
                });
            } else {
                // If the folder is not empty, delete all objects inside the folder
                s3.deleteObjects({ Bucket: bucketName, Delete: { Objects: objects } }, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Once all objects inside the folder are deleted, delete the folder itself
                    s3.deleteObject({ Bucket: bucketName, Key: folderName }, (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(data)
                    });
                });
            }
        });
    })
}

exports.renameFile = (oldKey, newKey) => {
    return new Promise((resolve, reject) => {
        const bucket = process.env.aws_bucket;
        // Copy the file with the new name
        s3.copyObject({
            Bucket: bucket,
            CopySource: `/${bucket}/${oldKey}`,
            Key: newKey
        }, (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            console.log('File renamed successfully');

            // Delete the original file
            s3.deleteObject({
                Bucket: bucket,
                Key: oldKey
            }, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                console.log('Original file deleted successfully');
                resolve(data)
            });
        });
    })
}

exports.createFolder = (folder_name) => {
    const params = {
        Bucket: process.env.aws_bucket,
        Key: folder_name,
        Body: ''
    };

    return new Promise((resolve, reject) => {
        s3.putObject(params, (err, data) => {
            if (err) {
                return reject(err)
            }

            resolve(data)
        });
    })
}

exports.getSignedURL = (file) => {
    const params = {
        Bucket: process.env.aws_bucket,
        Key: file,
        Expires: 3600 // The expiration time for the URL (in seconds)
    };

    // Generate a signed URL for the file
    const signedUrl = s3.getSignedUrl('getObject', params);
    return signedUrl
}