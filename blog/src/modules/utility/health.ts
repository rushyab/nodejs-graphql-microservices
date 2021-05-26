import { Resolver, Query } from "type-graphql";

@Resolver()
export default class HealthResolver {
  @Query(() => Boolean)
  getBlogServiceHealth(): boolean {
    return true;
  }
}
