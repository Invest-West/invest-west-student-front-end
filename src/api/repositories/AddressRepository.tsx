import axios, {AxiosResponse} from "axios";
import Address from "../../models/address";

export default class AddressRepository {

    public async findAddress(postcode: string) {
        return new Promise(async (resolve: (addresses: Address[]) => void, reject) => {
            let url = `https://api.getAddress.io/find/${postcode}?api-key=${process.env.REACT_APP_GET_ADDRESS_API_KEY}&sort=True&format=True`;
            try {
                const response: AxiosResponse = await axios.get(url);
                const data = response.data;

                if (!data.addresses) {
                    return reject("No addresses can be found.");
                }

                let results: Address[] = [];
                data.addresses.forEach((addressArray: any) => {
                    const address: Address = {
                        address1: addressArray[0],
                        address2: addressArray[1],
                        address3: addressArray[2],
                        postcode: addressArray[3],
                        townCity: addressArray[4]
                    };
                    results.push(address);
                });

                return resolve(results);
            } catch (error) {
                console.log(error);
                return reject("Error finding address.");
            }
        });
    }
}