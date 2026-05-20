import { supabase } from "../lib/supabase";

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<{ needsConfirmation: boolean; emailTaken: boolean }> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // When email enumeration protection is active and the email is already
  // registered via a social provider, Supabase returns a fake success with
  // session=null and an empty identities array instead of an error.
  const emailTaken = data.session === null && (data.user?.identities?.length ?? 0) === 0;
  const needsConfirmation = data.session === null && !emailTaken;
  return { needsConfirmation, emailTaken };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/**
 * Verify the 6-digit signup confirmation code emailed to the user.
 * On success, Supabase issues a session — RootNavigator picks it up via onAuthStateChange.
 */
export async function verifySignupOtp(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });
  if (error) throw error;
}

/** Resend the signup confirmation code to the same email. */
export async function resendSignupOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw error;
}
