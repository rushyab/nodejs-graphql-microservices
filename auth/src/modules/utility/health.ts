import { Resolver, Query } from "type-graphql";

@Resolver()
export default class HealthResolver {
  @Query(() => Boolean)
  getAuthServiceHealth(): boolean {
    return true;
  }
}
