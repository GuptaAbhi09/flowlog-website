import type { User } from "@/types";
import { users } from "@/lib/mockData";
import { delay } from "./helpers";

export async function login(
  email: string,
  _password: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<User | null> {
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  return delay(user ?? null);
}

export async function getCurrentUser(userId: string): Promise<User | null> {
  const user = users.find((u) => u.id === userId);
  return delay(user ?? null);
}
