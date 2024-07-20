export function cutFullName(names: string = '', lastNames: string = '') {
    return `${names.split(' ').at(0)} ${lastNames.split(' ').at(0)}`;
 }
 