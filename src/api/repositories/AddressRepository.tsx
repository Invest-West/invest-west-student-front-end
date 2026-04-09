import axios from 'axios';
import Address from '../../models/address';

class AddressRepository {
  public async findAddress(postcode: string): Promise<Address[]> {
    const url = `https://api.getAddress.io/find/${postcode}?api-key=${process.env.REACT_APP_GET_ADDRESS_API_KEY}&sort=True&format=True`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data.addresses) {
      throw new Error('No addresses can be found.');
    }

    return data.addresses.map((addressArray: any) => ({
      address1: addressArray[0],
      address2: addressArray[1],
      address3: addressArray[2],
      postcode: addressArray[3],
      townCity: addressArray[4],
    }));
  }
}

export { AddressRepository };
export default new AddressRepository();
