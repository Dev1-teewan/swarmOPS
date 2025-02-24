import { NextResponse } from "next/server";

export function convertToApiError(error: unknown) {
  if (error instanceof Error && error.name === "AbortError") {
    return NextResponse.json(
      { error: "Request timed out after 5 minutes" },
      { status: 504 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  console.error("Unexpected error:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Validation failed") {
    super(message, 400);
  }
}

export class GenericError extends ApiError {
  constructor(message = "Something went wrong") {
    super(message, 500);
  }
}

// Error messages from streamText are masked by default
// To forward error details to the client or to log errors, use the getErrorMessage function when calling toDataStreamResponse.
// https://sdk.vercel.ai/docs/troubleshooting/use-chat-an-error-occurred
export function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}
