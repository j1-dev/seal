import { Message } from '@/components/form-message';
import LogIn from '@/components/auth/log-in';

export default async function Login(props: { searchParams: Promise<Message> }) {
  return <LogIn searchParams={props.searchParams} />;
}
