export default interface Address {
    address1: string;
    address2?: string;
    address3?: string;
    postcode: string;
    townCity: string;
}

export const getFormattedAddress = (address: Address | undefined) => {
    let formattedAddress: string = "";
    if (!address) {
        return formattedAddress;
    }
    if (address.address1 === "none") {
        return "none";
    }
    formattedAddress = formattedAddress + address.address1 + ", ";
    if (address.address2 && address.address2.trim().length > 0) {
        formattedAddress = formattedAddress + address.address2 + ", ";
    }
    if (address.address3 && address.address3.trim().length > 0) {
        formattedAddress = formattedAddress + address.address3 + ", ";
    }
    formattedAddress = formattedAddress + address.postcode + ", ";
    formattedAddress = formattedAddress + address.townCity;
    return formattedAddress;
}