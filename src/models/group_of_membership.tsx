import GroupProperties from "./group_properties";

export default interface GroupOfMembership {
    group: GroupProperties;
    joinedDate: number;
    isHomeGroup: boolean;
    userInGroupStatus: number;
}

export const getHomeGroup = (groups: GroupOfMembership[]): GroupOfMembership | null => {
    const index = groups.findIndex(group => group.isHomeGroup);
    if (index !== -1) {
        return groups[index];
    }
    return null;
}