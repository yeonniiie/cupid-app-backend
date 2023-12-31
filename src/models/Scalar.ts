// import {GraphQLDateTime} from 'graphql-iso-date';
import { DateTimeResolver } from 'graphql-scalars';
// @ts-ignore
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import {asNexusMethod, enumType, scalarType} from 'nexus';

export const AuthType = enumType({
  name: 'AuthType',
  members: ['Email', 'Facebook', 'Google', 'Apple'],
});

enum GenderType {
  male = 'male',
  female = 'female',
}

export const Gender = scalarType({
  name: 'Gender',
  asNexusMethod: 'gender',
  parseValue(value: GenderType): GenderType | undefined {
    if (GenderType[value]) {
      return value;
    }
  },
  serialize(value) {
    return value;
  },
});

export const Upload = GraphQLUpload;
export const DateTime = asNexusMethod(DateTimeResolver, 'date');
