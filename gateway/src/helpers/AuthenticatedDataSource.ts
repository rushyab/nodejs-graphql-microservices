import { RemoteGraphQLDataSource } from '@apollo/gateway';
import { GraphQLRequestContext, GraphQLResponse } from 'apollo-server-types';
import { GATEWAY_ORIGIN } from '../constants/common';
import { MyContext } from '../modules/context';

export default class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({
    request,
    context,
  }: Pick<GraphQLRequestContext<MyContext>, 'request' | 'context'>): void {
    // This means that the gateway is starting up.
    // It will ping the microservices for their schema.
    // (If req, can be used to skip auth check)
    if (context.req === undefined) {
      request.http?.headers.set('x-gateway', 'true');
      return;
    }

    const { headers } = context.req;

    if (!headers) return;

    Object.keys(headers).map(
      (key) =>
        request.http && request.http.headers.set(key, headers[key] as string),
    );

    // To Allow CORS for requests from Gateway
    request.http?.headers.set('origin', GATEWAY_ORIGIN);

    // Pass the decoded user from the context to underlying services
    request.extensions = {
      user: context.user,
    };
  }

  didReceiveResponse({
    response,
    context,
  }: Required<
    Pick<GraphQLRequestContext<MyContext>, 'request' | 'response' | 'context'>
  >): GraphQLResponse {
    if (context.res === undefined) return response;

    const cookie = response.http?.headers.get('set-cookie');

    if (cookie) {
      // Forward set cookies
      context.res.set('set-cookie', cookie);
    }

    return response;
  }
}
