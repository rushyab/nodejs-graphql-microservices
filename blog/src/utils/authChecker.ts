import { AuthChecker } from 'type-graphql';
import { MyContext } from '../modules/context';

const authChecker: AuthChecker<MyContext> = async (
  { context: { user } },
  roles
) => {
  if (!user) return false;

  if (roles.length > 0 && !roles.includes(user.role)) return false;

  return true;
};

export default authChecker;
