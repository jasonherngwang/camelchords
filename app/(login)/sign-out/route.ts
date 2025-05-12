import { signOut } from '../actions';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  await signOut();
  const url = new URL('/library', request.url);
  return NextResponse.redirect(url);
} 