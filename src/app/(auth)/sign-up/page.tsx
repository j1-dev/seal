import { Message } from '@/components/form-message';
import SignUp from '@/components/auth/sign-up';

export default async function Login(props: { searchParams: Promise<Message> }) {
  return <SignUp searchParams={props.searchParams} />;
}
