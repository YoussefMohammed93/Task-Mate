import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Main() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <div>Welcome to task mate web app</div>
    </div>
  );
}
