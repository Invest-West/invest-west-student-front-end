import {uploadFile, UploadFileData} from "../../firebase/cloud_storage";

export default class FileRepository {

    /**
     * Upload file to Cloud storage
     *
     * @param data
     */
    public async uploadSingleFile(data: UploadFileData) {
        return await uploadFile(data);
    }
}