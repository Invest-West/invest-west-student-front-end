import firebaseApp from "./firebaseApp";
import firebase from "firebase/app";

export interface UploadFileData {
    file: File | Blob;
    fileName: string | number;
    storageLocation: string;
}

/**
 * Upload file to Cloud storage
 *
 * @param data
 */
export const uploadFile = async (data: UploadFileData) => {
    return new Promise(async (resolve: (url: string) => void, reject) => {
        try {
            const uploadTask: firebase.storage.UploadTask = firebaseApp
                .storage()
                .ref(`${data.storageLocation}/${data.fileName}`)
                .put(data.file);

            await uploadTask.then();

            const downloadURL: string = await uploadTask.snapshot.ref.getDownloadURL();
            return resolve(downloadURL);
        } catch (error) {
            return reject(error);
        }
    });
}