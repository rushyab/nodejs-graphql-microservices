import { NonEmptyArray, ClassType } from 'type-graphql';
import HealthResolver from './utility/health';

const resolvers: NonEmptyArray<ClassType> = [HealthResolver];

export default resolvers;
