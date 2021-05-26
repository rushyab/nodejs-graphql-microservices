import { Resolver, Query } from 'type-graphql';

@Resolver()
export default class HealthResolver {
  @Query(() => Boolean)
  getGatewayHealth(): boolean {
    return true;
  }
}
