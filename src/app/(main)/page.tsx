"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Main() {
  const user = useQuery(api.users.currentUser);

  return (
    <div className="container mx-auto max-w-7xl">
      {user && (
        <div className="pt-5 space-y-5">
          <h1>
            Welcome {user?.firstName} {user.lastName}!
          </h1>
          <Image
            src={user.imageUrl || "/avatar.png"}
            alt={`${user.firstName} 's Image`}
            width={100}
            height={100}
            loading="eager"
            className="border"
          />
        </div>
      )}
    </div>
  );
}
