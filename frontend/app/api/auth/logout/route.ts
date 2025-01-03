// app/api/auth/logout.ts
import { NextResponse } from 'next/server';

export async function POST() {
  // Clear the token on the client side
  return NextResponse.json({ message: 'Logged out' }, { status: 200 });
}
