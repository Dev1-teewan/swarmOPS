"use client";

import React from "react";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import LoginButton from "@/app/_components/login-button";
import swarmOsSquare from "@/app/_public/swarmOPS-500x500-transparent@4x.png";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const NotLoggedInAlert: React.FC = () => {
  const { ready, user } = usePrivy();

  return (
    <AlertDialog open={ready && !user}>
      <AlertDialogHeader className="hidden">
        <AlertDialogTitle>You are not logged in</AlertDialogTitle>
        <AlertDialogDescription>
          Please login to continue
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogContent className="flex flex-col items-center justify-center">
        <Image src={swarmOsSquare} alt={"swarmOs"} width={50} />
        <h1 className="text-2xl font-bold">You are not logged in</h1>
        <p className="text-sm text-gray-900">Please login to continue</p>
        <LoginButton />
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotLoggedInAlert;
