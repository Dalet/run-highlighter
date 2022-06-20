export function assertNever(x: never): never {
  const err = new Error("Unexpected object: " + x);

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
    debugger;
  }

  throw err;
}